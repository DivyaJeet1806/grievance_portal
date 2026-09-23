import Grievance from '../models/Grievance.js';
import { readGrievances, writeGrievances, resetGrievancesStore } from '../models/grievanceStore.js';
import { getDepartmentForCategory } from '../utils/departmentRouting.js';
import { isDBConnected } from '../config/db.js';
import { reseedDatabase } from '../utils/seedData.js';

// GET /api/grievances
export async function getGrievances(req, res) {
  try {
    const { status, category, urgency, search } = req.query;

    if (isDBConnected()) {
      const filter = {};
      if (status && status !== 'ALL') {
        filter.status = new RegExp(`^${status}$`, 'i');
      }
      if (category && category !== 'ALL') {
        filter.category = new RegExp(`^${category}$`, 'i');
      }
      if (urgency && urgency !== 'ALL') {
        filter.urgency = new RegExp(`^${urgency}$`, 'i');
      }
      if (search && search.trim()) {
        const q = search.trim();
        filter.$or = [
          { id: { $regex: q, $options: 'i' } },
          { title: { $regex: q, $options: 'i' } },
          { submittedBy: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ];
      }

      const list = await Grievance.find(filter).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, count: list.length, data: list });
    }

    // Fallback to file-based store
    let list = await readGrievances();
    if (status && status !== 'ALL') {
      list = list.filter(g => g.status.toLowerCase() === status.toLowerCase());
    }
    if (category && category !== 'ALL') {
      list = list.filter(g => g.category.toLowerCase() === category.toLowerCase());
    }
    if (urgency && urgency !== 'ALL') {
      list = list.filter(g => g.urgency.toLowerCase() === urgency.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(g => 
        g.id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.submittedBy.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/grievances/:id
export async function getGrievanceById(req, res) {
  try {
    const idParam = req.params.id;

    if (isDBConnected()) {
      const item = await Grievance.findOne({ id: new RegExp(`^${idParam}$`, 'i') }).lean();
      if (!item) {
        return res.status(404).json({ success: false, message: `Ticket #${idParam} not found.` });
      }
      return res.json({ success: true, data: item });
    }

    const list = await readGrievances();
    const item = list.find(g => g.id.toUpperCase() === idParam.toUpperCase());
    if (!item) {
      return res.status(404).json({ success: false, message: `Ticket #${idParam} not found.` });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/grievances
export async function createGrievance(req, res) {
  try {
    const { title, category, description, location, urgency, name, email, attachment } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required." });
    }

    const complainantName = req.user ? req.user.name : (name ? name.trim() : "Student Complainant");
    const complainantEmail = req.user ? req.user.email : (email ? email.trim() : "");

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newId = `GRV-2026-${randomCode}`;
    const now = new Date();

    const slaMap = { Low: 96, Medium: 72, High: 48, Critical: 24 };
    const targetCat = category || "Other General Matters";
    const deptInfo = getDepartmentForCategory(targetCat);
    const assignedDepartment = deptInfo.department;
    const assignedOfficer = deptInfo.officer;

    const newTicketData = {
      id: newId,
      title: title.trim(),
      category: targetCat,
      department: assignedDepartment,
      description: description.trim(),
      location: location ? location.trim() : "Main Campus",
      urgency: urgency || "Medium",
      status: "Submitted",
      submittedBy: complainantName,
      contactEmail: complainantEmail,
      isAnonymous: false,
      assignedTo: assignedOfficer,
      assignedDepartment: assignedDepartment,
      slaHours: slaMap[urgency] || deptInfo.slaHours || 48,
      timeline: [
        {
          stage: "Submitted",
          timestamp: now,
          message: `Grievance registered and automatically assigned to ${assignedDepartment} (${assignedOfficer}) under institutional dispatch protocol.`,
          actor: "Automated Routing Engine"
        }
      ],
      resolutionNotes: "",
      rating: null,
      feedback: null,
      attachment: attachment || null
    };

    if (isDBConnected()) {
      const createdTicket = await Grievance.create(newTicketData);
      return res.status(201).json({
        success: true,
        message: `Ticket ${newId} registered successfully in MongoDB`,
        data: createdTicket
      });
    }

    const list = await readGrievances();
    list.unshift(newTicketData);
    await writeGrievances(list);

    res.status(201).json({
      success: true,
      message: `Ticket ${newId} registered successfully`,
      data: newTicketData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// PATCH /api/grievances/:id
export async function updateGrievance(req, res) {
  try {
    const { newStatus, assignedOfficer, officerNote, actorName = 'Redressal Officer' } = req.body;
    const idParam = req.params.id;
    const now = new Date();

    if (isDBConnected()) {
      const current = await Grievance.findOne({ id: new RegExp(`^${idParam}$`, 'i') });
      if (!current) {
        return res.status(404).json({ success: false, message: `Ticket #${idParam} not found.` });
      }

      const statusChanged = newStatus && newStatus !== current.status;
      const assignedChanged = assignedOfficer && assignedOfficer !== current.assignedTo;

      if (statusChanged || assignedChanged || officerNote) {
        let actionDesc = officerNote || "";
        if (!actionDesc) {
          if (statusChanged && assignedChanged) {
            actionDesc = `Status updated to "${newStatus}" & assigned to ${assignedOfficer}.`;
          } else if (statusChanged) {
            actionDesc = `Status transitioned to "${newStatus}".`;
          } else if (assignedChanged) {
            actionDesc = `Assigned to ${assignedOfficer} for investigation.`;
          }
        }

        current.timeline.push({
          stage: newStatus || current.status,
          timestamp: now,
          message: actionDesc,
          actor: actorName
        });
      }

      if (newStatus) current.status = newStatus;
      if (assignedOfficer !== undefined) current.assignedTo = assignedOfficer;
      if (officerNote) current.resolutionNotes = officerNote;
      current.updatedAt = now;

      await current.save();
      return res.json({ success: true, message: "Ticket updated successfully", data: current });
    }

    // Fallback file handling
    const list = await readGrievances();
    const index = list.findIndex(g => g.id.toUpperCase() === idParam.toUpperCase());

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Ticket #${idParam} not found.` });
    }

    const current = list[index];
    const newTimeline = [...(current.timeline || [])];
    const statusChanged = newStatus && newStatus !== current.status;
    const assignedChanged = assignedOfficer && assignedOfficer !== current.assignedTo;

    if (statusChanged || assignedChanged || officerNote) {
      let actionDesc = officerNote || "";
      if (!actionDesc) {
        if (statusChanged && assignedChanged) {
          actionDesc = `Status updated to "${newStatus}" & assigned to ${assignedOfficer}.`;
        } else if (statusChanged) {
          actionDesc = `Status transitioned to "${newStatus}".`;
        } else if (assignedChanged) {
          actionDesc = `Assigned to ${assignedOfficer} for investigation.`;
        }
      }

      newTimeline.push({
        stage: newStatus || current.status,
        timestamp: now.toISOString(),
        message: actionDesc,
        actor: actorName
      });
    }

    const updated = {
      ...current,
      status: newStatus || current.status,
      assignedTo: assignedOfficer !== undefined ? assignedOfficer : current.assignedTo,
      resolutionNotes: officerNote ? officerNote : current.resolutionNotes,
      updatedAt: now.toISOString(),
      timeline: newTimeline
    };

    list[index] = updated;
    await writeGrievances(list);

    res.json({ success: true, message: "Ticket updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/grievances/:id/rating
export async function rateGrievance(req, res) {
  try {
    const { rating, feedback } = req.body;
    const idParam = req.params.id;

    if (isDBConnected()) {
      const item = await Grievance.findOne({ id: new RegExp(`^${idParam}$`, 'i') });
      if (!item) {
        return res.status(404).json({ success: false, message: `Ticket #${idParam} not found.` });
      }

      item.rating = Number(rating);
      item.feedback = feedback ? feedback.trim() : "";
      item.updatedAt = new Date();
      await item.save();

      return res.json({ success: true, message: "Rating saved successfully", data: item });
    }

    const list = await readGrievances();
    const index = list.findIndex(g => g.id.toUpperCase() === idParam.toUpperCase());

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Ticket #${idParam} not found.` });
    }

    list[index].rating = Number(rating);
    list[index].feedback = feedback ? feedback.trim() : "";
    list[index].updatedAt = new Date().toISOString();

    await writeGrievances(list);

    res.json({ success: true, message: "Rating saved successfully", data: list[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/analytics
export async function getAnalytics(req, res) {
  try {
    let list;
    if (isDBConnected()) {
      list = await Grievance.find().lean();
    } else {
      list = await readGrievances();
    }

    const totalCount = list.length;
    const pendingCount = list.filter(g => g.status === 'Submitted' || g.status === 'Under Review').length;
    const inProgressCount = list.filter(g => g.status === 'In Progress').length;
    const resolvedCount = list.filter(g => g.status === 'Resolved').length;
    const criticalCount = list.filter(g => g.urgency === 'Critical' && g.status !== 'Resolved').length;
    const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

    const categoryCounts = {};
    list.forEach(g => {
      categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalCount,
        pendingCount,
        inProgressCount,
        resolvedCount,
        criticalCount,
        resolutionRate,
        categoryCounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/grievances/:id/confirm-resolution
export async function confirmResolution(req, res) {
  try {
    const { 
      confirmedByRole = 'department',
      confirmedByName,
      status = 'Resolved',
      notes = '',
      rating = null,
      feedback = ''
    } = req.body;
    const idParam = req.params.id;
    const now = new Date();

    if (isDBConnected()) {
      const current = await Grievance.findOne({ id: new RegExp(`^${idParam}$`, 'i') });
      if (!current) {
        return res.status(404).json({ success: false, message: `Ticket #${idParam} not found.` });
      }

      if (confirmedByRole === 'department') {
        current.status = status || 'Resolved';
        current.departmentConfirmed = true;
        current.departmentConfirmedAt = now;
        current.departmentConfirmedBy = confirmedByName || current.assignedTo || 'Department Officer';
        if (notes) current.resolutionNotes = notes;

        current.timeline.push({
          stage: current.status,
          timestamp: now,
          message: `Department Confirmed Solved: ${notes || 'Issue inspected and confirmed resolved by designated department officer.'}`,
          actor: current.departmentConfirmedBy
        });
      } else if (confirmedByRole === 'complainant') {
        if (status === 'Reopened') {
          current.status = 'In Progress';
          current.complainantConfirmed = false;
          current.timeline.push({
            stage: 'In Progress',
            timestamp: now,
            message: `Complainant Reopened Ticket: ${notes || 'Issue not resolved adequately on ground.'}`,
            actor: confirmedByName || current.submittedBy || 'Complainant'
          });
        } else {
          current.complainantConfirmed = true;
          current.complainantConfirmedAt = now;
          current.complainantConfirmedBy = confirmedByName || current.submittedBy || 'Complainant';
          if (rating) current.rating = Number(rating);
          if (feedback || notes) current.feedback = feedback || notes;

          current.timeline.push({
            stage: 'Resolved',
            timestamp: now,
            message: `Complainant Confirmed Solved: ${notes || feedback || 'Citizen/Student verified that the problem is solved satisfactorily.'}`,
            actor: current.complainantConfirmedBy
          });
        }
      } else {
        current.status = status || 'Resolved';
        if (notes) current.resolutionNotes = notes;
        current.timeline.push({
          stage: current.status,
          timestamp: now,
          message: notes || 'Resolution confirmed.',
          actor: confirmedByName || 'Redressal Cell'
        });
      }

      current.updatedAt = now;
      await current.save();

      return res.json({ success: true, message: 'Resolution confirmed successfully', data: current });
    }

    // Fallback file handling
    const list = await readGrievances();
    const index = list.findIndex(g => g.id.toUpperCase() === idParam.toUpperCase());

    if (index === -1) {
      return res.status(404).json({ success: false, message: `Ticket #${idParam} not found.` });
    }

    const current = list[index];
    const newTimeline = [...(current.timeline || [])];

    if (confirmedByRole === 'department') {
      current.status = status || 'Resolved';
      current.departmentConfirmed = true;
      current.departmentConfirmedAt = now.toISOString();
      current.departmentConfirmedBy = confirmedByName || current.assignedTo || 'Department Officer';
      if (notes) current.resolutionNotes = notes;

      newTimeline.push({
        stage: current.status,
        timestamp: now.toISOString(),
        message: `Department Confirmed Solved: ${notes || 'Issue inspected and confirmed resolved by designated department officer.'}`,
        actor: current.departmentConfirmedBy
      });
    } else if (confirmedByRole === 'complainant') {
      if (status === 'Reopened') {
        current.status = 'In Progress';
        current.complainantConfirmed = false;
        newTimeline.push({
          stage: 'In Progress',
          timestamp: now.toISOString(),
          message: `Complainant Reopened Ticket: ${notes || 'Issue not resolved adequately on ground.'}`,
          actor: confirmedByName || current.submittedBy || 'Complainant'
        });
      } else {
        current.complainantConfirmed = true;
        current.complainantConfirmedAt = now.toISOString();
        current.complainantConfirmedBy = confirmedByName || current.submittedBy || 'Complainant';
        if (rating) current.rating = Number(rating);
        if (feedback || notes) current.feedback = feedback || notes;

        newTimeline.push({
          stage: 'Resolved',
          timestamp: now.toISOString(),
          message: `Complainant Confirmed Solved: ${notes || feedback || 'Citizen/Student verified that the problem is solved satisfactorily.'}`,
          actor: current.complainantConfirmedBy
        });
      }
    } else {
      current.status = status || 'Resolved';
      if (notes) current.resolutionNotes = notes;
      newTimeline.push({
        stage: current.status,
        timestamp: now.toISOString(),
        message: notes || 'Resolution confirmed.',
        actor: confirmedByName || 'Redressal Cell'
      });
    }

    current.updatedAt = now.toISOString();
    current.timeline = newTimeline;

    list[index] = current;
    await writeGrievances(list);

    res.json({ success: true, message: 'Resolution confirmed successfully', data: current });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/grievances/reset
export async function resetDatabase(req, res) {
  try {
    let resetData;
    if (isDBConnected()) {
      resetData = await reseedDatabase();
    } else {
      resetData = await resetGrievancesStore();
    }
    res.json({ success: true, message: "Database reset to initial demo state", count: resetData.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Consultation from '@/models/Consultation';
import Review from '@/models/Review';
import { authenticateApi } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const decoded = await authenticateApi(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const consultation = await Consultation.findById(id).lean();
    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    const userEmail = (decoded.email || '').toLowerCase();
    const isOwner = (consultation.userId && consultation.userId.toString() === decoded.userId.toString()) ||
      (consultation.customerDetails?.email && consultation.customerDetails.email.toLowerCase() === userEmail);

    if (!isOwner && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(consultation, { status: 200 });
  } catch (error) {
    console.error('Fetch consultation error:', error);
    return NextResponse.json({ error: 'Failed to retrieve consultation' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const decoded = await authenticateApi(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    const userEmail = (decoded.email || '').toLowerCase();
    const isOwner = (consultation.userId && consultation.userId.toString() === decoded.userId.toString()) ||
      (consultation.customerDetails?.email && consultation.customerDetails.email.toLowerCase() === userEmail);

    if (!isOwner && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Action: update_requirements (Pre-meeting requirements)
    if (action === 'update_requirements') {
      const { text, goals, specificQuestions, attachments } = body;

      const questionsList = Array.isArray(specificQuestions)
        ? specificQuestions.map(q => String(q).trim()).filter(Boolean)
        : (specificQuestions ? [String(specificQuestions).trim()] : []);

      const attachmentsList = Array.isArray(attachments)
        ? attachments.map(a => String(a).trim()).filter(Boolean)
        : (attachments ? [String(attachments).trim()] : []);

      consultation.requirements = {
        text: (text || '').trim(),
        goals: (goals || '').trim(),
        specificQuestions: questionsList,
        attachments: attachmentsList,
        updatedAt: new Date()
      };

      if (text && (!consultation.message || consultation.message === 'N/A')) {
        consultation.message = text.trim();
      }

      await consultation.save();
      return NextResponse.json({ message: 'Requirements updated successfully', consultation }, { status: 200 });
    }

    // 2. Action: submit_follow_up (Post-meeting follow-up & action plan)
    if (action === 'submit_follow_up') {
      const { keyTakeaways, actionItems } = body;

      const formattedActionItems = Array.isArray(actionItems)
        ? actionItems.map((item, idx) => {
            if (typeof item === 'string') {
              return {
                id: `act_${Date.now()}_${idx}`,
                title: item.trim(),
                completed: false,
                completedAt: null
              };
            }
            return {
              id: item.id || `act_${Date.now()}_${idx}`,
              title: (item.title || item.task || '').trim(),
              completed: Boolean(item.completed),
              completedAt: item.completed ? (item.completedAt || new Date()) : null
            };
          }).filter(item => Boolean(item.title))
        : [];

      const completedCount = formattedActionItems.filter(i => i.completed).length;
      const allDone = formattedActionItems.length > 0 && completedCount === formattedActionItems.length;

      consultation.followUp = {
        filled: true,
        keyTakeaways: (keyTakeaways || '').trim(),
        actionItems: formattedActionItems,
        status: allDone ? 'completed' : (formattedActionItems.length > 0 ? 'in_progress' : 'pending'),
        filledAt: consultation.followUp?.filledAt || new Date(),
        updatedAt: new Date()
      };

      await consultation.save();
      return NextResponse.json({ message: 'Follow-up saved successfully', consultation }, { status: 200 });
    }

    // 3. Action: toggle_task (Toggle completion of an action item)
    if (action === 'toggle_task') {
      const { taskId, completed } = body;
      if (!taskId) {
        return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
      }

      if (!consultation.followUp || !Array.isArray(consultation.followUp.actionItems)) {
        return NextResponse.json({ error: 'No follow-up action items found' }, { status: 400 });
      }

      const task = consultation.followUp.actionItems.find(i => i.id === taskId);
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      task.completed = Boolean(completed);
      task.completedAt = task.completed ? new Date() : null;

      const totalItems = consultation.followUp.actionItems.length;
      const doneItems = consultation.followUp.actionItems.filter(i => i.completed).length;
      consultation.followUp.status = (totalItems > 0 && doneItems === totalItems) ? 'completed' : 'in_progress';
      consultation.followUp.updatedAt = new Date();

      await consultation.save();
      return NextResponse.json({ message: 'Task updated successfully', consultation }, { status: 200 });
    }

    // 4. Action: add_task (Add new task to checklist)
    if (action === 'add_task') {
      const { title } = body;
      if (!title || !title.trim()) {
        return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
      }

      if (!consultation.followUp) {
        consultation.followUp = {
          filled: true,
          keyTakeaways: '',
          actionItems: [],
          status: 'in_progress',
          filledAt: new Date(),
          updatedAt: new Date()
        };
      }

      consultation.followUp.actionItems.push({
        id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        title: title.trim(),
        completed: false,
        completedAt: null
      });

      consultation.followUp.filled = true;
      consultation.followUp.status = 'in_progress';
      consultation.followUp.updatedAt = new Date();

      await consultation.save();
      return NextResponse.json({ message: 'Action item added', consultation }, { status: 200 });
    }

    // 5. Action: submit_feedback (Feedback form after follow-up)
    if (action === 'submit_feedback') {
      // Must have filled follow up first
      if (!consultation.followUp || !consultation.followUp.filled) {
        return NextResponse.json({ 
          error: 'Please complete your post-session follow-up before submitting feedback.' 
        }, { status: 400 });
      }

      const { rating, comment } = body;
      const numRating = Number(rating);
      if (!numRating || numRating < 1 || numRating > 5) {
        return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
      }
      if (!comment || !comment.trim()) {
        return NextResponse.json({ error: 'Feedback comment is required' }, { status: 400 });
      }

      consultation.feedback = {
        filled: true,
        rating: numRating,
        comment: comment.trim(),
        filledAt: new Date()
      };

      await consultation.save();

      // Optionally sync with Review collection
      try {
        const userName = consultation.customerDetails?.name || decoded.name || 'Client';
        const userEmailClean = (consultation.customerDetails?.email || decoded.email || '').toLowerCase();
        const typeLabel = consultation.type === 'startup' ? 'Start-up Mentorship Session' : '1-on-1 Strategy Consultation';

        await Review.findOneAndUpdate(
          { userId: decoded.userId, itemType: 'platform', itemId: consultation._id },
          {
            userName,
            userEmail: userEmailClean,
            itemType: 'platform',
            itemId: consultation._id,
            itemTitle: `${typeLabel} with Avinash S. Gore`,
            rating: numRating,
            comment: comment.trim(),
            verified: true,
            status: 'approved'
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (revErr) {
        console.error('Failed to sync consultation review:', revErr);
      }

      return NextResponse.json({ message: 'Feedback submitted successfully', consultation }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action provided' }, { status: 400 });

  } catch (error) {
    console.error('Consultation PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update consultation' }, { status: 500 });
  }
}

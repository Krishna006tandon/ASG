import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CareerAssessment from '@/models/CareerAssessment';

export async function PATCH(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const { sessionStatus, meetingLink, taskId, taskCompleted } = body;

    const updateFields = {};
    if (sessionStatus) updateFields.sessionStatus = sessionStatus;
    if (meetingLink !== undefined) updateFields.meetingLink = meetingLink;

    let updatedAssessment = await CareerAssessment.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!updatedAssessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (taskId && updatedAssessment.followUp?.actionItems) {
      const task = updatedAssessment.followUp.actionItems.find(i => i.id === taskId);
      if (task) {
        task.completed = Boolean(taskCompleted);
        task.completedAt = task.completed ? new Date() : null;
        const total = updatedAssessment.followUp.actionItems.length;
        const done = updatedAssessment.followUp.actionItems.filter(i => i.completed).length;
        updatedAssessment.followUp.status = (total > 0 && done === total) ? 'completed' : 'in_progress';
        updatedAssessment.followUp.updatedAt = new Date();
        await updatedAssessment.save();
      }
    }

    return NextResponse.json(updatedAssessment, { status: 200 });
  } catch (error) {
    console.error('Admin PATCH career assessment error:', error);
    return NextResponse.json({ error: 'Failed to update career assessment' }, { status: 500 });
  }
}

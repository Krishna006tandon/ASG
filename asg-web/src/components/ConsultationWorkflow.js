"use client";

import { useState } from 'react';

export default function ConsultationWorkflow({ appt, onUpdate, isStartup = false }) {
  // Modals state
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Requirements form state
  const [reqText, setReqText] = useState('');
  const [reqGoals, setReqGoals] = useState('');
  const [reqQuestions, setReqQuestions] = useState('');
  const [isSavingReq, setIsSavingReq] = useState(false);

  // Follow-up form state
  const [followUpTakeaways, setFollowUpTakeaways] = useState('');
  const [followUpTasks, setFollowUpTasks] = useState(['']);
  const [isSavingFollowUp, setIsSavingFollowUp] = useState(false);

  // Quick add task state
  const [quickTaskInput, setQuickTaskInput] = useState('');
  const [isAddingQuickTask, setIsAddingQuickTask] = useState(false);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  const themeColor = isStartup ? '#059669' : '#4F46E5';
  const themeLight = isStartup ? '#ECFDF5' : '#EEF2FF';
  const themeBorder = isStartup ? '#A7F3D0' : '#C7D2FE';

  // 1. OPEN REQUIREMENTS MODAL
  const handleOpenReqModal = () => {
    setReqText(appt.requirements?.text || appt.message || '');
    setReqGoals(appt.requirements?.goals || '');
    const questions = appt.requirements?.specificQuestions || [];
    setReqQuestions(questions.join('\n'));
    setReqModalOpen(true);
  };

  const handleSaveReq = async (e) => {
    e.preventDefault();
    if (!reqText.trim()) {
      alert('Please describe your requirements.');
      return;
    }
    setIsSavingReq(true);
    try {
      const token = localStorage.getItem('asg_token');
      const questionsList = reqQuestions
        .split('\n')
        .map(q => q.trim())
        .filter(Boolean);

      const res = await fetch(`/api/user/consultations/${appt._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'update_requirements',
          text: reqText,
          goals: reqGoals,
          specificQuestions: questionsList
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update requirements');

      if (onUpdate && data.consultation) {
        onUpdate(data.consultation);
      }
      setReqModalOpen(false);
      alert('Requirements saved! Admin will review your session requirements.');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSavingReq(false);
    }
  };

  // 2. OPEN FOLLOW-UP MODAL
  const handleOpenFollowUpModal = () => {
    setFollowUpTakeaways(appt.followUp?.keyTakeaways || '');
    const currentTasks = appt.followUp?.actionItems || [];
    if (currentTasks.length > 0) {
      setFollowUpTasks(currentTasks.map(t => t.title));
    } else {
      setFollowUpTasks(['', '']);
    }
    setFollowUpModalOpen(true);
  };

  const handleAddTaskField = () => {
    setFollowUpTasks([...followUpTasks, '']);
  };

  const handleRemoveTaskField = (index) => {
    const updated = followUpTasks.filter((_, idx) => idx !== index);
    setFollowUpTasks(updated.length > 0 ? updated : ['']);
  };

  const handleTaskChange = (index, value) => {
    const updated = [...followUpTasks];
    updated[index] = value;
    setFollowUpTasks(updated);
  };

  const handleSaveFollowUp = async (e) => {
    e.preventDefault();
    const validTasks = followUpTasks.map(t => t.trim()).filter(Boolean);
    if (!followUpTakeaways.trim() && validTasks.length === 0) {
      alert('Please provide at least session takeaways or 1 action item to complete.');
      return;
    }

    setIsSavingFollowUp(true);
    try {
      const token = localStorage.getItem('asg_token');
      const res = await fetch(`/api/user/consultations/${appt._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'submit_follow_up',
          keyTakeaways: followUpTakeaways,
          actionItems: validTasks
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit follow-up');

      if (onUpdate && data.consultation) {
        onUpdate(data.consultation);
      }
      setFollowUpModalOpen(false);
      alert('Follow-up and action plan saved! You can now track your task progress and leave session feedback.');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSavingFollowUp(false);
    }
  };

  // 3. TOGGLE ACTION TASK
  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const token = localStorage.getItem('asg_token');
      const res = await fetch(`/api/user/consultations/${appt._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'toggle_task',
          taskId,
          completed: !currentStatus
        })
      });

      const data = await res.json();
      if (res.ok && onUpdate && data.consultation) {
        onUpdate(data.consultation);
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // 4. QUICK ADD ACTION TASK
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTaskInput.trim()) return;

    setIsAddingQuickTask(true);
    try {
      const token = localStorage.getItem('asg_token');
      const res = await fetch(`/api/user/consultations/${appt._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'add_task',
          title: quickTaskInput.trim()
        })
      });

      const data = await res.json();
      if (res.ok && onUpdate && data.consultation) {
        onUpdate(data.consultation);
        setQuickTaskInput('');
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setIsAddingQuickTask(false);
    }
  };

  // 5. OPEN FEEDBACK MODAL
  const handleOpenFeedbackModal = () => {
    if (!appt.followUp || !appt.followUp.filled) {
      alert('Please fill out your post-session follow-up before submitting feedback.');
      return;
    }
    setFeedbackRating(appt.feedback?.rating || 5);
    setFeedbackComment(appt.feedback?.comment || '');
    setFeedbackModalOpen(true);
  };

  const handleSaveFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackComment.trim()) {
      alert('Please share a few words about your session experience.');
      return;
    }

    setIsSavingFeedback(true);
    try {
      const token = localStorage.getItem('asg_token');
      const res = await fetch(`/api/user/consultations/${appt._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'submit_feedback',
          rating: feedbackRating,
          comment: feedbackComment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');

      if (onUpdate && data.consultation) {
        onUpdate(data.consultation);
      }
      setFeedbackModalOpen(false);
      alert('Thank you for your feedback! It helps us continually elevate our mentorship sessions.');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSavingFeedback(false);
    }
  };

  // Derived calculations
  const hasRequirements = Boolean(appt.requirements?.text || appt.message);
  const isCompleted = appt.status === 'Completed';
  const hasFollowUp = Boolean(appt.followUp?.filled);
  const actionItems = appt.followUp?.actionItems || [];
  const completedTasksCount = actionItems.filter(i => i.completed).length;
  const progressPercent = actionItems.length > 0 
    ? Math.round((completedTasksCount / actionItems.length) * 100) 
    : 0;
  const hasFeedback = Boolean(appt.feedback?.filled);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
      
      {/* ----------------- STEP 1: PRE-SESSION REQUIREMENTS ----------------- */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
            <span>📋</span> Pre-Session Requirements &amp; Goals
          </div>
          <button
            type="button"
            onClick={handleOpenReqModal}
            style={{
              background: '#FFFFFF',
              border: `1px solid ${themeBorder}`,
              color: themeColor,
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <span>{hasRequirements ? '✏️ Edit Requirements' : '➕ Add Requirements'}</span>
          </button>
        </div>

        {hasRequirements ? (
          <div>
            {appt.requirements?.goals && (
              <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.35rem' }}>
                <strong style={{ color: '#0F172A' }}>Goal:</strong> {appt.requirements.goals}
              </div>
            )}
            <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
              {appt.requirements?.text || appt.message}
            </div>
            {appt.requirements?.specificQuestions && appt.requirements.specificQuestions.length > 0 && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #CBD5E1' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Questions to discuss:
                </span>
                <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#334155' }}>
                  {appt.requirements.specificQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>💡</span> You haven't added specific requirements yet. Click &quot;Add Requirements&quot; so Avinash Gore can review them before your call.
          </div>
        )}
      </div>

      {/* ----------------- STEP 2: POST-MEETING FOLLOW-UP & ACTION PLAN ----------------- */}
      {isCompleted ? (
        <div style={{
          background: hasFollowUp ? '#FFFFFF' : '#FFFBEB',
          border: `1.5px solid ${hasFollowUp ? (progressPercent === 100 ? '#86EFAC' : themeBorder) : '#FCD34D'}`,
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          {!hasFollowUp ? (
            /* Prompt user to fill follow-up */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🔔</span>
                <strong style={{ fontSize: '1rem', color: '#92400E' }}>
                  Meeting Completed! Submit Your Follow-Up &amp; Action Plan
                </strong>
              </div>
              <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.88rem', color: '#78350F', lineHeight: '1.5' }}>
                Please record the key takeaways and specific execution tasks discussed with Avinash S. Gore. You must track and complete these tasks to achieve your session outcomes.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleOpenFollowUpModal}
                  style={{
                    background: themeColor,
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span>📝</span> Fill Post-Session Follow-Up &amp; Action Plan
                </button>
                <span style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: 600 }}>
                  🔒 Session Feedback unlocks after submitting follow-up
                </span>
              </div>
            </div>
          ) : (
            /* Follow-up has been filled: show takeaways, checklist, progress bar */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>📝</span> Follow-Up &amp; Execution Action Plan
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem' }}>
                    Track and check off each task you committed to completing.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenFollowUpModal}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Edit Takeaways / Tasks
                </button>
              </div>

              {/* Takeaways Box */}
              {appt.followUp.keyTakeaways && (
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  marginBottom: '1rem'
                }}>
                  <strong style={{ fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>
                    💡 Key Takeaways &amp; Mentor Advice
                  </strong>
                  <div style={{ fontSize: '0.88rem', color: '#1E293B', lineHeight: '1.55', whiteSpace: 'pre-line' }}>
                    {appt.followUp.keyTakeaways}
                  </div>
                </div>
              )}

              {/* Action Items Checklist */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#334155', textTransform: 'uppercase' }}>
                    Action Items Checklist ({completedTasksCount} of {actionItems.length} Completed)
                  </strong>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: progressPercent === 100 ? '#166534' : themeColor }}>
                    {progressPercent}% Complete
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '50px', overflow: 'hidden', marginBottom: '0.85rem' }}>
                  <div style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: progressPercent === 100 
                      ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' 
                      : `linear-gradient(90deg, ${themeColor} 0%, #818CF8 100%)`,
                    transition: 'width 0.4s ease'
                  }} />
                </div>

                {/* Task Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.85rem' }}>
                  {actionItems.map((task) => (
                    <label
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: task.completed ? '#F0FDF4' : '#F8FAFC',
                        border: `1px solid ${task.completed ? '#BBF7D0' : '#E2E8F0'}`,
                        borderRadius: '8px',
                        padding: '0.55rem 0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={Boolean(task.completed)}
                          onChange={() => handleToggleTask(task.id, task.completed)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: themeColor }}
                        />
                        <span style={{
                          fontSize: '0.88rem',
                          color: task.completed ? '#166534' : '#1E293B',
                          textDecoration: task.completed ? 'line-through' : 'none',
                          fontWeight: task.completed ? 600 : 500
                        }}>
                          {task.title}
                        </span>
                      </div>
                      {task.completed && (
                        <span style={{ fontSize: '0.72rem', color: '#166534', background: '#DCFCE7', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                          ✓ Done
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                {/* Inline Quick Add Task */}
                <form onSubmit={handleQuickAdd} style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    value={quickTaskInput}
                    onChange={(e) => setQuickTaskInput(e.target.value)}
                    placeholder="Add an additional action item..."
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isAddingQuickTask || !quickTaskInput.trim()}
                    style={{
                      background: themeColor,
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Add Task
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic', padding: '0.25rem 0' }}>
          ⏳ Post-meeting follow-up checklist &amp; feedback form will activate once this consultation is conducted and marked Completed.
        </div>
      )}

      {/* ----------------- STEP 3: POST-FOLLOW-UP FEEDBACK FORM ----------------- */}
      {isCompleted && (
        <div style={{
          background: hasFeedback ? '#FAF5FF' : (hasFollowUp ? '#FDF4FF' : '#F1F5F9'),
          border: `1px solid ${hasFeedback ? '#D8B4FE' : (hasFollowUp ? '#F0ABFC' : '#E2E8F0')}`,
          borderRadius: '10px',
          padding: '1rem'
        }}>
          {!hasFollowUp ? (
            /* Locked Feedback banner */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', opacity: 0.75 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                <span>🔒</span> Session Feedback Form (Complete follow-up above to unlock)
              </div>
            </div>
          ) : !hasFeedback ? (
            /* Unlocked Feedback Prompt */
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: '#7E22CE', fontSize: '0.92rem' }}>
                  <span>⭐</span> How was your session? Share your feedback!
                </div>
                <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '0.15rem' }}>
                  Follow-up completed! Tell us about your consultation experience with Avinash S. Gore.
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenFeedbackModal}
                style={{
                  background: 'linear-gradient(135deg, #7E22CE 0%, #6B21A8 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.5rem 1.15rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(126, 34, 206, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>⭐</span> Submit Session Feedback
              </button>
            </div>
          ) : (
            /* Already Submitted Feedback Display */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.1rem', color: '#EAB308' }}>
                    {'★'.repeat(appt.feedback.rating)}{'☆'.repeat(5 - appt.feedback.rating)}
                  </span>
                  <strong style={{ fontSize: '0.88rem', color: '#6B21A8' }}>
                    Verified Session Feedback ({appt.feedback.rating}/5)
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={handleOpenFeedbackModal}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D8B4FE',
                    color: '#6B21A8',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Edit Feedback
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#374151', lineHeight: '1.5', fontStyle: 'italic' }}>
                &ldquo;{appt.feedback.comment}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* --------------------------- REQUIREMENTS MODAL -------------------------- */}
      {/* ========================================================================= */}
      {reqModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', maxWidth: '600px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <button
              onClick={() => setReqModalOpen(false)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: '#F1F5F9', border: 'none', width: '32px', height: '32px',
                borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B'
              }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem 0' }}>
              📋 Consultation Requirements &amp; Goals
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.25rem 0' }}>
              Avinash Gore will review these details prior to your session to tailor the guidance directly to your objectives.
            </p>

            <form onSubmit={handleSaveReq} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Primary Goal / Topic Focus (Optional)
                </label>
                <input
                  type="text"
                  value={reqGoals}
                  onChange={(e) => setReqGoals(e.target.value)}
                  placeholder="e.g. Scaling customer acquisition / Validating MVP pricing"
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Detailed Requirements &amp; Current Situation *
                </label>
                <textarea
                  rows="4"
                  required
                  value={reqText}
                  onChange={(e) => setReqText(e.target.value)}
                  placeholder="Explain your venture or career background, key challenges you are encountering, and what guidance you require..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Specific Questions for Avinash Gore (1 per line)
                </label>
                <textarea
                  rows="3"
                  value={reqQuestions}
                  onChange={(e) => setReqQuestions(e.target.value)}
                  placeholder="1. How should I structure my B2B pricing?&#10;2. What key metrics should I track before raising seed capital?"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setReqModalOpen(false)}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingReq}
                  style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: themeColor, color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isSavingReq ? 'Saving Requirements...' : 'Save Requirements'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --------------------------- FOLLOW-UP MODAL ----------------------------- */}
      {/* ========================================================================= */}
      {followUpModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', maxWidth: '650px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <button
              onClick={() => setFollowUpModalOpen(false)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: '#F1F5F9', border: 'none', width: '32px', height: '32px',
                borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B'
              }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem 0' }}>
              📝 Post-Session Follow-Up &amp; Action Plan
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.25rem 0' }}>
              Document your takeaways and list the action items you need to execute. You and the admin can monitor your task completion progress.
            </p>

            <form onSubmit={handleSaveFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Key Takeaways &amp; Strategic Advice
                </label>
                <textarea
                  rows="3"
                  value={followUpTakeaways}
                  onChange={(e) => setFollowUpTakeaways(e.target.value)}
                  placeholder="Summarize the core insights, solutions, and strategic directions suggested by Avinash Gore..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    Action Items / Tasks to Complete *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTaskField}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      color: themeColor,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Add Another Task
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {followUpTasks.map((task, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94A3B8', width: '20px' }}>
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={task}
                        onChange={(e) => handleTaskChange(idx, e.target.value)}
                        placeholder={`e.g. ${idx === 0 ? 'Revise customer onboarding pitch' : idx === 1 ? 'Schedule 5 user feedback interviews' : 'Draft financial projections for Q1'}`}
                        style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                      {followUpTasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTaskField(idx)}
                          style={{
                            background: '#FEE2E2',
                            border: 'none',
                            color: '#EF4444',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                          }}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setFollowUpModalOpen(false)}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFollowUp}
                  style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: themeColor, color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isSavingFollowUp ? 'Saving Plan...' : 'Save Follow-Up & Action Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --------------------------- FEEDBACK MODAL ------------------------------ */}
      {/* ========================================================================= */}
      {feedbackModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', maxWidth: '550px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <button
              onClick={() => setFeedbackModalOpen(false)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: '#F1F5F9', border: 'none', width: '32px', height: '32px',
                borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B'
              }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem 0' }}>
              ⭐ Consultation Feedback &amp; Review
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.25rem 0' }}>
              How was your 1-on-1 session with Avinash S. Gore? Your review helps future entrepreneurs and students.
            </p>

            <form onSubmit={handleSaveFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Star Rating Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Overall Rating *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (feedbackHoverRating || feedbackRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        onMouseEnter={() => setFeedbackHoverRating(star)}
                        onMouseLeave={() => setFeedbackHoverRating(0)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          fontSize: '2rem',
                          color: isFilled ? '#EAB308' : '#CBD5E1',
                          cursor: 'pointer',
                          padding: '0 0.15rem',
                          lineHeight: 1
                        }}
                      >
                        ★
                      </button>
                    );
                  })}
                  <span style={{ marginLeft: '0.5rem', fontWeight: 700, color: '#6B21A8', fontSize: '0.9rem' }}>
                    {feedbackRating === 5 ? '5/5 - Outstanding' :
                     feedbackRating === 4 ? '4/5 - Very Good' :
                     feedbackRating === 3 ? '3/5 - Good' :
                     feedbackRating === 2 ? '2/5 - Fair' : '1/5 - Poor'}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Your Feedback &amp; Key Value Received *
                </label>
                <textarea
                  rows="4"
                  required
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="How did the consultation help you? What insights or actionable guidance made the biggest impact?"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFeedback}
                  style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: 'linear-gradient(135deg, #7E22CE 0%, #6B21A8 100%)', color: '#FFFFFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isSavingFeedback ? 'Submitting Feedback...' : 'Submit Verified Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

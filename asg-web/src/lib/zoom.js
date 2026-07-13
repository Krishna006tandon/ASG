export async function getZoomAccessToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom API credentials are not configured in environment variables.');
  }

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Zoom Auth Error:', errorData);
    throw new Error('Failed to obtain Zoom access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function createZoomMeeting(topic, startTimeStr, durationMinutes = 60) {
  try {
    const token = await getZoomAccessToken();

    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: topic,
        type: 2, // Scheduled meeting
        start_time: startTimeStr, // ISO 8601 string
        duration: durationMinutes,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 0,
          audio: 'both',
          auto_recording: 'none'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Zoom Create Meeting Error:', errorData);
      throw new Error('Failed to create Zoom meeting');
    }

    const meetingData = await response.json();
    return meetingData.join_url;
  } catch (error) {
    console.error('Zoom Integration Error:', error.message);
    return null; // Return null gracefully so the payment process doesn't fail if Zoom fails
  }
}

// OpenAI service for generating personalized mental health recommendations
// In production, this should call your FastAPI backend which handles OpenAI API calls

export interface MentalHealthTipsRequest {
  stressScore: number;
  primaryEmotion: string;
  emotionBreakdown: {
    label: string;
    score: number;
  }[];
  hasTextAnalysis: boolean;
  hasFaceAnalysis: boolean;
  textStress?: number;
  faceStress?: number;
}

export interface MentalHealthTipsResponse {
  summary: string;
  tips: string[];
  resources: {
    title: string;
    description: string;
  }[];
}

// Mock OpenAI response - In production, replace with actual API call
export async function generateMentalHealthTips(
  request: MentalHealthTipsRequest
): Promise<MentalHealthTipsResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const { stressScore, primaryEmotion, emotionBreakdown } = request;
  
  // Generate contextual summary
  let summary = '';
  if (stressScore < 0.3) {
    summary = `Your emotional state indicates low stress levels with ${primaryEmotion} as the dominant emotion. This is a positive indicator of mental well-being. Continue maintaining your current lifestyle and emotional regulation practices.`;
  } else if (stressScore < 0.6) {
    summary = `Your analysis reveals moderate stress levels with ${primaryEmotion} being predominant. While this is manageable, it's important to implement stress-reduction techniques and maintain awareness of your emotional state throughout the day.`;
  } else {
    summary = `The analysis shows elevated stress levels with ${primaryEmotion} as the primary emotion. This suggests you may benefit from immediate stress-management interventions and possibly seeking professional support to address these emotional challenges.`;
  }

  // Generate detailed, personalized tips based on emotion and stress
  const tips: string[] = [];
  
  if (stressScore < 0.3) {
    tips.push(
      'Maintain your current routine: Your stress levels are healthy. Document what activities and habits are working well for you so you can return to them during more challenging times.',
      'Practice gratitude journaling: Spend 5-10 minutes each evening writing down three things you\'re grateful for. This reinforces positive neural pathways and emotional resilience.',
      'Share your wellness: Consider mentoring others or sharing your stress-management techniques with friends who might be struggling.',
      'Preventive self-care: Even during low-stress periods, maintain regular exercise (30 minutes daily), quality sleep (7-9 hours), and social connections.',
      'Build emotional reserves: Use this positive period to develop new coping skills like meditation, creative hobbies, or learning relaxation techniques for future challenges.'
    );
  } else if (stressScore < 0.6) {
    tips.push(
      'Implement the 4-7-8 breathing technique: Breathe in for 4 counts, hold for 7, exhale for 8. Practice this 3-4 times daily, especially when you notice stress building. This activates your parasympathetic nervous system.',
      'Schedule micro-breaks: Set a timer for every 50 minutes of work. Take a 5-10 minute break to stretch, walk, or practice mindfulness. These breaks significantly reduce cumulative stress.',
      'Progressive muscle relaxation: Before bed, systematically tense and relax each muscle group from your toes to your head. This reduces physical tension and improves sleep quality.',
      'Limit stimulants: Reduce caffeine intake after 2 PM and minimize screen time 1 hour before bed. Blue light and stimulants can amplify stress responses and disrupt sleep.',
      'Connect with others: Reach out to a friend, family member, or colleague for a meaningful conversation. Social support is one of the most effective stress buffers.',
      'Physical activity: Aim for 30 minutes of moderate exercise (brisk walking, swimming, cycling) 5 days a week. Exercise releases endorphins and reduces cortisol levels.'
    );
  } else {
    tips.push(
      'Immediate stress reduction: Practice box breathing (4 counts in, 4 hold, 4 out, 4 hold) for 5 minutes right now. This quickly calms your nervous system and reduces acute stress responses.',
      'Seek professional support: Your stress levels warrant professional attention. Consider scheduling an appointment with a licensed therapist, counselor, or mental health professional who can provide personalized guidance.',
      'Crisis resources: If you\'re experiencing thoughts of self-harm, call the 988 Suicide & Crisis Lifeline (US) or your country\'s emergency mental health line immediately. Help is available 24/7.',
      'Prioritize essential tasks: Create a list of must-do items and postpone non-urgent commitments. Reducing your workload even temporarily can provide mental space to recover.',
      'Establish a wind-down routine: Dedicate 30-60 minutes before bed to calming activities: warm bath, gentle stretching, reading fiction, or listening to calming music. Avoid work-related content.',
      'Nutrition and hydration: Stress depletes essential nutrients. Eat regular, balanced meals with complex carbs, proteins, and omega-3 fatty acids. Stay hydrated with 8 glasses of water daily.',
      'Mindfulness meditation: Use apps like Headspace, Calm, or Insight Timer for 10-20 minute guided meditations. Daily practice rewires stress responses and builds emotional regulation.',
      'Identify stress triggers: Keep a brief journal noting when stress spikes occur. Identifying patterns helps you develop targeted coping strategies and make informed lifestyle changes.'
    );
  }

  // Add emotion-specific tips
  const emotionTips: Record<string, string[]> = {
    sadness: [
      'Behavioral activation: Even if you don\'t feel like it, engage in one enjoyable activity daily. Depression and sadness often rob us of motivation, but action can precede motivation.',
      'Sunlight exposure: Spend 15-30 minutes in natural sunlight each morning. Light exposure regulates mood-affecting hormones like serotonin and melatonin.'
    ],
    anger: [
      'Anger journaling: Write down what triggered your anger without filtering. This externalizes the emotion and often reveals underlying needs or boundaries that require attention.',
      'Physical release: Engage in high-intensity exercise (running, boxing, intense cycling) to metabolize stress hormones and release pent-up emotional energy constructively.'
    ],
    fear: [
      'Grounding techniques: Use the 5-4-3-2-1 method when anxious - identify 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This anchors you in the present moment.',
      'Exposure hierarchy: With a therapist\'s guidance, gradually expose yourself to feared situations in controlled increments. This systematically reduces anxiety over time.'
    ],
    anxiety: [
      'Worry time: Designate 15 minutes daily as "worry time." When anxious thoughts arise throughout the day, postpone them to this scheduled period. This contains anxiety and prevents rumination.',
      'Acceptance practice: Instead of fighting anxious thoughts, acknowledge them: "I notice I\'m having thoughts about..." This creates distance and reduces their power.'
    ]
  };

  const emotionKey = primaryEmotion.toLowerCase();
  if (emotionTips[emotionKey]) {
    tips.push(...emotionTips[emotionKey]);
  }

  // Generate resources
  const resources = [
    {
      title: '988 Suicide & Crisis Lifeline',
      description: '24/7 free and confidential support for people in distress. Call or text 988 (US) or visit 988lifeline.org'
    },
    {
      title: 'NAMI (National Alliance on Mental Illness)',
      description: 'Provides education, support groups, and resources for mental health conditions. Helpline: 1-800-950-NAMI'
    },
    {
      title: 'Psychology Today Therapist Finder',
      description: 'Search for licensed therapists in your area by specialty, insurance, and treatment approach at psychologytoday.com'
    },
    {
      title: 'Headspace / Calm Apps',
      description: 'Evidence-based meditation and mindfulness apps with guided sessions for stress, anxiety, and sleep'
    },
    {
      title: 'BetterHelp / Talkspace',
      description: 'Online therapy platforms connecting you with licensed therapists via text, video, or phone'
    }
  ];

  if (stressScore >= 0.6) {
    resources.unshift({
      title: 'IMMEDIATE HELP - Text HOME to 741741',
      description: 'Crisis Text Line provides free, 24/7 support via text message for any crisis. Trained counselors respond within minutes.'
    });
  }

  return {
    summary,
    tips: tips.slice(0, 8), // Limit to 8 most relevant tips
    resources: resources.slice(0, stressScore >= 0.6 ? 6 : 5)
  };
}

// Function to call OpenAI API (for production use)
// This should be implemented in your FastAPI backend to keep API keys secure
export async function callOpenAIAPI(
  request: MentalHealthTipsRequest
): Promise<MentalHealthTipsResponse> {
  // In production, this would make a fetch call to your FastAPI backend
  // which would then call OpenAI API with proper authentication
  
  const prompt = `You are a compassionate mental health advisor. Based on the following emotional analysis, provide personalized mental health recommendations:

Stress Score: ${request.stressScore.toFixed(2)} (0-1 scale)
Primary Emotion: ${request.primaryEmotion}
Emotion Breakdown: ${JSON.stringify(request.emotionBreakdown)}
Analysis Type: ${request.hasTextAnalysis ? 'Text' : ''}${request.hasFaceAnalysis ? ' + Facial' : ''}

Provide:
1. A brief summary of their emotional state (2-3 sentences)
2. 5-8 detailed, actionable mental health tips
3. 4-5 professional resources they can access

Format the response as JSON with keys: summary, tips (array), resources (array of objects with title and description).`;

  // Mock response - replace with actual OpenAI call in production
  const response = await fetch('YOUR_FASTAPI_BACKEND/api/generate-tips', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, ...request })
  });

  return await response.json();
}

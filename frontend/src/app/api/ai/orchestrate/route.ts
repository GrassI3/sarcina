import { NextResponse } from 'next/server';

type OrchestrationTask = {
  id?: string;
  text: string;
  completed?: boolean;
};

export async function POST(request: Request) {
  try {
    const {
      tasks = [],
      planner,
      mood,
    }: { tasks?: OrchestrationTask[]; planner?: unknown; mood?: string } = await request.json();

    // Mock LLM response
    const priorityScores = tasks.map((task) => ({
      ...task,
      priorityScore: Math.random(),
    }));

    const ambientTheme = mood === 'Focus' ? 'fuchsia-500/30' : 'emerald-500/20';

    return NextResponse.json({ priorityScores, ambientTheme, hasPlanner: Boolean(planner) });
  } catch (error) {
    console.error('Error in AI orchestration:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

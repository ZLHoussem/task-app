import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { supabase } from '@/utils/supabase';

export const taskRouter = router({
  list: publicProcedure.query(async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw new Error(error.message);
    return data;
  }),

  add: publicProcedure
    .input(z.object({ title: z.string(), description: z.string().optional() }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase.from('tasks').insert([input]).select().single();
      if (error) throw new Error(error.message);
      return data;
    }),

  delete: publicProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ input }) => {
    console.log('Deleting task ID:', input.id); // ✅ log this
    const { error } = await supabase.from('tasks').delete().eq('id', input.id);
    if (error) throw new Error(error.message);
    return { success: true };
  }),


  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const { error } = await supabase.from('tasks').update({
        title: input.title,
        description: input.description
      }).eq('id', input.id);
      if (error) throw new Error(error.message);
      return { success: true };
    }),
});

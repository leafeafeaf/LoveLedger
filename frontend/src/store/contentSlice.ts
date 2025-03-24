import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BookItem, Story } from '../types';

interface ContentState {
  diaries: BookItem[];
  stories: BookItem[];
  currentStory: Story | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ContentState = {
  diaries: [],
  stories: [],
  currentStory: null,
  isLoading: false,
  error: null
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    fetchContentsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchContentsSuccess: (state, action: PayloadAction<{diaries: BookItem[], stories: BookItem[]}>) => {
      state.diaries = action.payload.diaries;
      state.stories = action.payload.stories;
      state.isLoading = false;
    },
    fetchContentsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCurrentStory: (state, action: PayloadAction<Story>) => {
      state.currentStory = action.payload;
    },
    clearCurrentStory: (state) => {
      state.currentStory = null;
    },
    addDiary: (state, action: PayloadAction<BookItem>) => {
      state.diaries.unshift(action.payload);
    },
    addStory: (state, action: PayloadAction<BookItem>) => {
      state.stories.unshift(action.payload);
    },
    updateContent: (state, action: PayloadAction<{id: string, type: 'diary' | 'story', data: Partial<BookItem>}>) => {
      const { id, type, data } = action.payload;
      if (type === 'diary') {
        const index = state.diaries.findIndex(d => d.id === id);
        if (index !== -1) {
          state.diaries[index] = {...state.diaries[index], ...data};
        }
      } else {
        const index = state.stories.findIndex(s => s.id === id);
        if (index !== -1) {
          state.stories[index] = {...state.stories[index], ...data};
        }
      }
    },
    deleteContent: (state, action: PayloadAction<{id: string, type: 'diary' | 'story'}>) => {
      const { id, type } = action.payload;
      if (type === 'diary') {
        state.diaries = state.diaries.filter(d => d.id !== id);
      } else {
        state.stories = state.stories.filter(s => s.id !== id);
      }
    }
  }
});

export const { 
  fetchContentsStart,
  fetchContentsSuccess,
  fetchContentsFailure,
  setCurrentStory,
  clearCurrentStory,
  addDiary,
  addStory,
  updateContent,
  deleteContent
} = contentSlice.actions;
export default contentSlice.reducer;
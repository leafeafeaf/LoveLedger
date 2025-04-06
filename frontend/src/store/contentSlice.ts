import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BookItem, Story } from '../types';

export interface DiaryContent {
  id: string;
  title: string;
  content: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  mood: number;
}

interface FictionDetail {
  id: string;
  title: string;
  content: string;
  arturl: string;
  createdAt: string;
  seriesname?: string;
}

interface ContentState {
  diaries: BookItem[];
  stories: BookItem[];
  currentStory: Story | null;
  isLoading: boolean;
  error: string | null;
  storyGeneration: {
    isGenerating: boolean;
    progress: number;
    error: string | null;
  };
  coverGeneration: {
    isGenerating: boolean;
    selectedStyle: string;
    coverImage: string | null;
    error: string | null;
  };
  storySaving: {
    isSaving: boolean;
    error: string | null;
    lastSavedStory: Story | null;
  };
  fictionList: {
    series: {
      seriesid: number;
      seriesname: string;
      fictions: {
        title: string;
        arturl: string;
        createat: string;
      }[];
    }[];
    isLoading: boolean;
    error: string | null;
  };
  fictionDetail: {
    data: FictionDetail | null;
    isLoading: boolean;
    error: string | null;
  };
  fictionDelete: {
    isLoading: boolean;
    error: string | null;
    success: boolean;
  };
  seriesDelete: {
    isLoading: boolean;
    error: string | null;
    success: boolean;
  };
  seriesCreate: {
    isLoading: boolean;
    error: string | null;
    success: boolean;
  };
  seriesList: {
    series: {
      seriesid: number;
      seriesname: string;
    }[];
    isLoading: boolean;
    error: string | null;
  };
  diary: {
    isLoading: boolean;
    error: string | null;
    diaries: DiaryContent[];
    currentDiary: DiaryContent | null;
  };
  diaryDelete: {
    isLoading: boolean;
    error: string | null;
    success: boolean;
  };
}

const initialState: ContentState = {
  diaries: [],
  stories: [],
  currentStory: null,
  isLoading: false,
  error: null,
  storyGeneration: {
    isGenerating: false,
    progress: 0,
    error: null
  },
  coverGeneration: {
    isGenerating: false,
    selectedStyle: "fantasy",
    coverImage: null,
    error: null
  },
  storySaving: {
    isSaving: false,
    error: null,
    lastSavedStory: null
  },
  fictionList: {
    series: [],
    isLoading: false,
    error: null
  },
  fictionDetail: {
    data: null,
    isLoading: false,
    error: null,
  },
  fictionDelete: {
    isLoading: false,
    error: null,
    success: false,
  },
  seriesDelete: {
    isLoading: false,
    error: null,
    success: false,
  },
  seriesCreate: {
    isLoading: false,
    error: null,
    success: false,
  },
  seriesList: {
    series: [],
    isLoading: false,
    error: null,
  },
  diary: {
    isLoading: false,
    error: null,
    diaries: [],
    currentDiary: null,
  },
  diaryDelete: {
    isLoading: false,
    error: null,
    success: false,
  },
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
    },
    startStoryGeneration: (state) => {
      state.storyGeneration.isGenerating = true;
      state.storyGeneration.progress = 0;
      state.storyGeneration.error = null;
    },
    updateStoryGenerationProgress: (state, action: PayloadAction<number>) => {
      state.storyGeneration.progress = action.payload;
    },
    storyGenerationSuccess: (state, action: PayloadAction<Story>) => {
      state.storyGeneration.isGenerating = false;
      state.storyGeneration.progress = 100;
      state.currentStory = action.payload;
    },
    storyGenerationFailure: (state, action: PayloadAction<string>) => {
      state.storyGeneration.isGenerating = false;
      state.storyGeneration.error = action.payload;
    },
    startCoverGeneration: (state, action: PayloadAction<string>) => {
      state.coverGeneration.isGenerating = true;
      state.coverGeneration.selectedStyle = action.payload;
      state.coverGeneration.error = null;
    },
    coverGenerationSuccess: (state, action: PayloadAction<string>) => {
      state.coverGeneration.isGenerating = false;
      state.coverGeneration.coverImage = action.payload;
    },
    coverGenerationFailure: (state, action: PayloadAction<string>) => {
      state.coverGeneration.isGenerating = false;
      state.coverGeneration.error = action.payload;
    },
    setCoverStyle: (state, action: PayloadAction<string>) => {
      state.coverGeneration.selectedStyle = action.payload;
    },
    clearCoverImage: (state) => {
      state.coverGeneration.coverImage = null;
    },
    startStorySaving: (state) => {
      state.storySaving.isSaving = true;
      state.storySaving.error = null;
    },
    storySavingSuccess: (state, action: PayloadAction<Story>) => {
      state.storySaving.isSaving = false;
      state.storySaving.lastSavedStory = action.payload;
      state.stories.unshift({
        id: action.payload.id || Date.now().toString(),
        title: action.payload.title,
        content: action.payload.content,
        coverImage: action.payload.coverImage,
        date: new Date().toISOString(),
        type: "story",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    storySavingFailure: (state, action: PayloadAction<string>) => {
      state.storySaving.isSaving = false;
      state.storySaving.error = action.payload;
    },
    clearStorySavingState: (state) => {
      state.storySaving = initialState.storySaving;
    },
    fetchFictionListStart: (state) => {
      state.fictionList.isLoading = true;
      state.fictionList.error = null;
    },
    fetchFictionListSuccess: (state, action: PayloadAction<{
      series: {
        seriesid: number;
        seriesname: string;
        fictions: {
          title: string;
          arturl: string;
          createat: string;
        }[];
      }[];
    }>) => {
      state.fictionList.series = action.payload.series;
      state.fictionList.isLoading = false;
    },
    fetchFictionListFailure: (state, action: PayloadAction<string>) => {
      state.fictionList.isLoading = false;
      state.fictionList.error = action.payload;
    },
    fetchFictionDetailStart: (state) => {
      state.fictionDetail.isLoading = true;
      state.fictionDetail.error = null;
    },
    fetchFictionDetailSuccess: (state, action: PayloadAction<FictionDetail>) => {
      state.fictionDetail.isLoading = false;
      state.fictionDetail.data = action.payload;
    },
    fetchFictionDetailFailure: (state, action: PayloadAction<string>) => {
      state.fictionDetail.isLoading = false;
      state.fictionDetail.error = action.payload;
    },
    deleteFictionStart: (state) => {
      state.fictionDelete.isLoading = true;
      state.fictionDelete.error = null;
      state.fictionDelete.success = false;
    },
    deleteFictionSuccess: (state) => {
      state.fictionDelete.isLoading = false;
      state.fictionDelete.success = true;
    },
    deleteFictionFailure: (state, action: PayloadAction<string>) => {
      state.fictionDelete.isLoading = false;
      state.fictionDelete.error = action.payload;
    },
    resetFictionDelete: (state) => {
      state.fictionDelete.isLoading = false;
      state.fictionDelete.error = null;
      state.fictionDelete.success = false;
    },
    deleteSeriesStart: (state) => {
      state.seriesDelete.isLoading = true;
      state.seriesDelete.error = null;
      state.seriesDelete.success = false;
    },
    deleteSeriesSuccess: (state) => {
      state.seriesDelete.isLoading = false;
      state.seriesDelete.success = true;
    },
    deleteSeriesFailure: (state, action: PayloadAction<string>) => {
      state.seriesDelete.isLoading = false;
      state.seriesDelete.error = action.payload;
    },
    resetSeriesDelete: (state) => {
      state.seriesDelete.isLoading = false;
      state.seriesDelete.error = null;
      state.seriesDelete.success = false;
    },
    createSeriesStart: (state) => {
      state.seriesCreate.isLoading = true;
      state.seriesCreate.error = null;
      state.seriesCreate.success = false;
    },
    createSeriesSuccess: (state) => {
      state.seriesCreate.isLoading = false;
      state.seriesCreate.success = true;
    },
    createSeriesFailure: (state, action: PayloadAction<string>) => {
      state.seriesCreate.isLoading = false;
      state.seriesCreate.error = action.payload;
    },
    resetSeriesCreate: (state) => {
      state.seriesCreate.isLoading = false;
      state.seriesCreate.error = null;
      state.seriesCreate.success = false;
    },
    fetchSeriesListStart: (state) => {
      state.seriesList.isLoading = true;
      state.seriesList.error = null;
    },
    fetchSeriesListSuccess: (state, action) => {
      state.seriesList.isLoading = false;
      state.seriesList.series = action.payload.series;
    },
    fetchSeriesListFailure: (state, action) => {
      state.seriesList.isLoading = false;
      state.seriesList.error = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.diary.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.diary.error = action.payload;
    },
    setDiaries: (state, action: PayloadAction<DiaryContent[]>) => {
      state.diary.diaries = action.payload;
    },
    setCurrentDiary: (state, action: PayloadAction<ContentState['diary']['currentDiary']>) => {
      state.diary.currentDiary = action.payload;
    },
    clearCurrentDiary: (state) => {
      state.diary.currentDiary = null;
    },
    fetchDiaryListStart: (state) => {
      state.diary.isLoading = true;
      state.diary.error = null;
    },
    fetchDiaryListSuccess: (state, action: PayloadAction<DiaryContent[]>) => {
      state.diary.isLoading = false;
      state.diary.diaries = action.payload;
    },
    fetchDiaryListFailure: (state, action: PayloadAction<string>) => {
      state.diary.isLoading = false;
      state.diary.error = action.payload;
    },
    deleteDiaryStart: (state) => {
      state.diaryDelete.isLoading = true;
      state.diaryDelete.error = null;
      state.diaryDelete.success = false;
    },
    deleteDiarySuccess: (state) => {
      state.diaryDelete.isLoading = false;
      state.diaryDelete.success = true;
    },
    deleteDiaryFailure: (state, action: PayloadAction<string>) => {
      state.diaryDelete.isLoading = false;
      state.diaryDelete.error = action.payload;
    },
    resetDiaryDelete: (state) => {
      state.diaryDelete.isLoading = false;
      state.diaryDelete.error = null;
      state.diaryDelete.success = false;
    },
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
  deleteContent,
  startStoryGeneration,
  updateStoryGenerationProgress,
  storyGenerationSuccess,
  storyGenerationFailure,
  startCoverGeneration,
  coverGenerationSuccess,
  coverGenerationFailure,
  setCoverStyle,
  clearCoverImage,
  startStorySaving,
  storySavingSuccess,
  storySavingFailure,
  clearStorySavingState,
  fetchFictionListStart,
  fetchFictionListSuccess,
  fetchFictionListFailure,
  fetchFictionDetailStart,
  fetchFictionDetailSuccess,
  fetchFictionDetailFailure,
  deleteFictionStart,
  deleteFictionSuccess,
  deleteFictionFailure,
  resetFictionDelete,
  deleteSeriesStart,
  deleteSeriesSuccess,
  deleteSeriesFailure,
  resetSeriesDelete,
  createSeriesStart,
  createSeriesSuccess,
  createSeriesFailure,
  resetSeriesCreate,
  fetchSeriesListStart,
  fetchSeriesListSuccess,
  fetchSeriesListFailure,
  setLoading,
  setError,
  setDiaries,
  setCurrentDiary,
  clearCurrentDiary,
  fetchDiaryListStart,
  fetchDiaryListSuccess,
  fetchDiaryListFailure,
  deleteDiaryStart,
  deleteDiarySuccess,
  deleteDiaryFailure,
  resetDiaryDelete,
} = contentSlice.actions;
export default contentSlice.reducer;
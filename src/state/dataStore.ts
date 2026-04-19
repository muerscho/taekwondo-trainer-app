import { create } from 'zustand';
import {
  athletesRepo, groupsRepo, beltRanksRepo, focusAreasRepo, blockCategoriesRepo,
  unitsRepo, blocksRepo, attendanceRepo, libraryRepo, termineRepo, aiConfigRepo,
  goalsRepo, graduationRepo, statsRepo, recommendationsRepo
} from '@/storage/repos';
import type {
  Athlete, Group, BeltRank, FocusArea, BlockCategory,
  TrainingUnit, TrainingBlock, LibraryEntry, Termin, AiConfig, AiFunctionToggle
} from '@/domain/types';

interface DataStore {
  ready: boolean;
  athletes: Athlete[];
  groups: Group[];
  beltRanks: BeltRank[];
  focusAreas: FocusArea[];
  blockCategories: BlockCategory[];
  units: TrainingUnit[];
  library: LibraryEntry[];
  termine: Termin[];
  aiConfig: AiConfig | null;
  aiToggles: AiFunctionToggle[];
  loadAll: () => void;
  reload: (key?: keyof Omit<DataStore, 'loadAll' | 'reload' | 'ready'>) => void;
}

export const useData = create<DataStore>((set) => ({
  ready: false,
  athletes: [], groups: [], beltRanks: [], focusAreas: [], blockCategories: [],
  units: [], library: [], termine: [], aiConfig: null, aiToggles: [],
  loadAll: () => {
    set({
      athletes: athletesRepo.list(),
      groups: groupsRepo.list(),
      beltRanks: beltRanksRepo.list(),
      focusAreas: focusAreasRepo.list(),
      blockCategories: blockCategoriesRepo.list(),
      units: unitsRepo.list(),
      library: libraryRepo.list(),
      termine: termineRepo.list(),
      aiConfig: aiConfigRepo.get(),
      aiToggles: aiConfigRepo.toggles(),
      ready: true
    });
  },
  reload: (key) => {
    if (!key) { useData.getState().loadAll(); return; }
    switch (key) {
      case 'athletes': set({ athletes: athletesRepo.list() }); break;
      case 'groups': set({ groups: groupsRepo.list() }); break;
      case 'beltRanks': set({ beltRanks: beltRanksRepo.list() }); break;
      case 'focusAreas': set({ focusAreas: focusAreasRepo.list() }); break;
      case 'blockCategories': set({ blockCategories: blockCategoriesRepo.list() }); break;
      case 'units': set({ units: unitsRepo.list() }); break;
      case 'library': set({ library: libraryRepo.list() }); break;
      case 'termine': set({ termine: termineRepo.list() }); break;
      case 'aiConfig': set({ aiConfig: aiConfigRepo.get() }); break;
      case 'aiToggles': set({ aiToggles: aiConfigRepo.toggles() }); break;
    }
  }
}));

export { athletesRepo, groupsRepo, beltRanksRepo, focusAreasRepo, blockCategoriesRepo, unitsRepo, blocksRepo, attendanceRepo, libraryRepo, termineRepo, aiConfigRepo, goalsRepo, graduationRepo, statsRepo, recommendationsRepo };

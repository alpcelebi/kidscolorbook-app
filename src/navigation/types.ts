export type RootStackParamList = {
  Home: undefined;
  Category: { categoryId: string };
  ColoringPage: { pageId: string };
  FreeDraw: { artworkId?: string };
  Gallery: undefined;
  Settings: undefined;
  ParentDashboard: undefined;
  Achievements: undefined;
  Stickers: { artworkId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

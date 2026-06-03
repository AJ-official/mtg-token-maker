export type AreaConfig = {
  top: string;
  left: string;
  width: string;
  height: string;
};

export type TextAreaConfig = AreaConfig & {
  fontSize: string;
  lineHeight: string;
};

export type TitleAreaConfig = {
  top: string;
  left: string;
  width: string;
  fontSize: string;
  fontWeight: string;
};

export type TypeAreaConfig = {
  top: string;
  left: string;
  width: string;
  fontSize: string;
};

export type ManaAreaConfig = {
  top: string;
  left: string;
  size: string;
};

export type PTAreaConfig = {
  top: string;
  left: string;
  fontSize: string;
  fontWeight: string;
};

export type FrameConfig = {
  id: string;
  name: string;
  file: string;
  forCardTypes?: string[];
  illustrationArea: AreaConfig;
  manaArea: ManaAreaConfig;
  titleArea: TitleAreaConfig;
  typeArea: TypeAreaConfig;
  textboxArea: TextAreaConfig;
  ptArea?: PTAreaConfig;
  loyaltyArea?: PTAreaConfig;
};

import type { ImageSourcePropType } from "react-native";
import { createWelcomeMessage, defaultMemberProfileId, memberProfileRecords } from "@vera/core";
import type { MemberProfile, MemberProfileId } from "@vera/core";

const portraitById: Record<MemberProfileId, ImageSourcePropType> = {
  jordan: require("../../assets/vera-portrait.jpg"),
  noor: require("../../assets/noor-profile.png"),
  josh: require("../../assets/josh-profile.png"),
};

export const memberProfiles: MemberProfile[] = memberProfileRecords.map((record) => ({
  ...record,
  portraitSrc: String(record.id),
}));

export function profilePortrait(profileId: MemberProfileId): ImageSourcePropType {
  return portraitById[profileId];
}

export const defaultMobileProfile =
  memberProfiles.find((profile) => profile.id === defaultMemberProfileId) ?? memberProfiles[0];

export { createWelcomeMessage };

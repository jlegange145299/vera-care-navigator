import joshPortrait from "../assets/josh-profile.png";
import noorPortrait from "../assets/noor-profile.png";
import jordanPortrait from "../assets/vera-portrait.jpg";
import { createWelcomeMessage as coreWelcome, defaultMemberProfileId, memberProfileRecords } from "@vera/core";
import type { MemberProfile, MemberProfileId } from "../types";

const portraitById: Record<MemberProfileId, string> = {
  jordan: jordanPortrait,
  noor: noorPortrait,
  josh: joshPortrait,
};

export const memberProfiles: MemberProfile[] = memberProfileRecords.map((record) => ({
  ...record,
  portraitSrc: portraitById[record.id],
}));

export const defaultMemberProfile =
  memberProfiles.find((profile) => profile.id === defaultMemberProfileId) ?? memberProfiles[0];

export { coreWelcome as createWelcomeMessage };

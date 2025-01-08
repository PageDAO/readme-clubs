import { Orbis } from "@orbisclub/orbis-sdk"

export const orbis = new Orbis()

export const getOrbisClient = () => {
  return orbis
}

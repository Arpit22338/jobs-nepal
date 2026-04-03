import { prisma } from "@/lib/prisma";

export async function getSetting(key: string): Promise<string | null> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key } });
    return setting?.value ?? null;
  } catch (error) {
    console.error(`Error fetching setting '${key}':`, error);
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  try {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  } catch (error) {
    console.error(`Error setting '${key}':`, error);
    throw error;
  }
}

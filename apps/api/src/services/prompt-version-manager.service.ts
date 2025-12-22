/**
 * Prompt Version Manager Service
 * Manages different versions of AI prompts with A/B testing and performance tracking
 */

import { PrismaClient } from '@astro/database';

const prisma = new PrismaClient();

export interface PromptVersion {
  id: string;
  predictionType: string;
  version: string;
  systemPrompt: string;
  active: boolean;
  performanceScore?: number;
  createdAt: Date;
}

export class PromptVersionManager {
  /**
   * Create a new prompt version
   */
  async createVersion(data: {
    predictionType: string;
    version: string;
    systemPrompt: string;
  }): Promise<string> {
    // Check if version already exists
    const existing = await prisma.promptVersion.findFirst({
      where: {
        predictionType: data.predictionType,
        version: data.version,
      },
    });

    if (existing) {
      throw new Error(
        `Version ${data.version} already exists for ${data.predictionType}`
      );
    }

    const promptVersion = await prisma.promptVersion.create({
      data: {
        predictionType: data.predictionType,
        version: data.version,
        systemPrompt: data.systemPrompt,
        active: false,
        performanceScore: null,
      },
    });

    console.log(
      `Created prompt version: ${data.predictionType} ${data.version}`
    );

    return promptVersion.id;
  }

  /**
   * Get active prompt for prediction type
   */
  async getActivePrompt(predictionType: string): Promise<PromptVersion | null> {
    const activePrompt = await prisma.promptVersion.findFirst({
      where: {
        predictionType,
        active: true,
      },
    });

    if (!activePrompt) {
      // Return default prompt if no active version
      return this.getDefaultPrompt(predictionType);
    }

    return activePrompt as PromptVersion;
  }

  /**
   * Get default prompt (fallback)
   */
  private async getDefaultPrompt(predictionType: string): Promise<PromptVersion | null> {
    // Try to get v1 or first version
    let defaultPrompt = await prisma.promptVersion.findFirst({
      where: {
        predictionType,
        version: 'v1',
      },
    });

    if (!defaultPrompt) {
      // Get any version
      defaultPrompt = await prisma.promptVersion.findFirst({
        where: { predictionType },
        orderBy: { createdAt: 'asc' },
      });
    }

    return defaultPrompt as PromptVersion | null;
  }

  /**
   * Set a version as active (deactivates others)
   */
  async setActive(versionId: string): Promise<void> {
    const version = await prisma.promptVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      throw new Error('Prompt version not found');
    }

    // Deactivate all other versions for this prediction type
    await prisma.promptVersion.updateMany({
      where: {
        predictionType: version.predictionType,
        active: true,
      },
      data: { active: false },
    });

    // Activate this version
    await prisma.promptVersion.update({
      where: { id: versionId },
      data: { active: true },
    });

    console.log(
      `Set active prompt: ${version.predictionType} ${version.version}`
    );
  }

  /**
   * Get all versions for a prediction type
   */
  async getAllVersions(predictionType: string): Promise<PromptVersion[]> {
    const versions = await prisma.promptVersion.findMany({
      where: { predictionType },
      orderBy: { createdAt: 'desc' },
    });

    return versions as PromptVersion[];
  }

  /**
   * Get version by ID
   */
  async getVersion(versionId: string): Promise<PromptVersion | null> {
    const version = await prisma.promptVersion.findUnique({
      where: { id: versionId },
    });

    return version as PromptVersion | null;
  }

  /**
   * Update performance score based on feedback
   */
  async updatePerformanceScore(versionId: string): Promise<void> {
    // Get all predictions using this prompt version
    // For now, we'll calculate based on feedback ratings
    const feedbacks = await prisma.predictionFeedback.findMany({
      include: {
        prediction: {
          select: {
            id: true,
            primaryAgent: true,
          },
        },
      },
    });

    // Filter feedbacks for predictions made with this version
    // Note: This requires storing prompt version ID in predictions table
    // For now, we'll calculate a simple average of recent ratings

    const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const avgRating = feedbacks.length > 0
      ? totalRating / feedbacks.length
      : 0;

    // Normalize to 0-1 scale
    const performanceScore = avgRating / 5;

    await prisma.promptVersion.update({
      where: { id: versionId },
      data: { performanceScore },
    });

    console.log(
      `Updated performance score for version ${versionId}: ${performanceScore.toFixed(3)}`
    );
  }

  /**
   * Compare versions
   */
  async compareVersions(versionId1: string, versionId2: string): Promise<{
    version1: PromptVersion;
    version2: PromptVersion;
    comparison: {
      performanceDiff: number;
      recommendation: string;
    };
  }> {
    const version1 = await this.getVersion(versionId1);
    const version2 = await this.getVersion(versionId2);

    if (!version1 || !version2) {
      throw new Error('One or both versions not found');
    }

    if (version1.predictionType !== version2.predictionType) {
      throw new Error('Cannot compare versions of different prediction types');
    }

    const score1 = version1.performanceScore || 0;
    const score2 = version2.performanceScore || 0;
    const performanceDiff = score2 - score1;

    let recommendation = '';
    if (performanceDiff > 0.1) {
      recommendation = `Version ${version2.version} performs significantly better (+${(performanceDiff * 100).toFixed(1)}%)`;
    } else if (performanceDiff < -0.1) {
      recommendation = `Version ${version1.version} performs significantly better (+${Math.abs(performanceDiff * 100).toFixed(1)}%)`;
    } else {
      recommendation = 'Both versions perform similarly';
    }

    return {
      version1,
      version2,
      comparison: {
        performanceDiff,
        recommendation,
      },
    };
  }

  /**
   * Get best performing version for each prediction type
   */
  async getBestVersions(): Promise<Array<{
    predictionType: string;
    version: string;
    performanceScore: number;
  }>> {
    const allVersions = await prisma.promptVersion.findMany({
      where: {
        performanceScore: { not: null },
      },
      orderBy: {
        performanceScore: 'desc',
      },
    });

    // Group by prediction type and get best for each
    const bestByType = new Map<string, {
      version: string;
      performanceScore: number;
    }>();

    allVersions.forEach(v => {
      const existing = bestByType.get(v.predictionType);
      const score = Number(v.performanceScore || 0);

      if (!existing || score > existing.performanceScore) {
        bestByType.set(v.predictionType, {
          version: v.version,
          performanceScore: score,
        });
      }
    });

    return Array.from(bestByType.entries()).map(([predictionType, data]) => ({
      predictionType,
      ...data,
    }));
  }

  /**
   * Delete a version (only if not active)
   */
  async deleteVersion(versionId: string): Promise<void> {
    const version = await prisma.promptVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      throw new Error('Version not found');
    }

    if (version.active) {
      throw new Error('Cannot delete active version. Set another version as active first.');
    }

    await prisma.promptVersion.delete({
      where: { id: versionId },
    });

    console.log(`Deleted prompt version: ${version.predictionType} ${version.version}`);
  }

  /**
   * Clone a version to create a new one
   */
  async cloneVersion(versionId: string, newVersion: string): Promise<string> {
    const original = await this.getVersion(versionId);

    if (!original) {
      throw new Error('Version not found');
    }

    return await this.createVersion({
      predictionType: original.predictionType,
      version: newVersion,
      systemPrompt: original.systemPrompt,
    });
  }

  /**
   * Seed default prompts for all prediction types
   */
  async seedDefaultPrompts(): Promise<void> {
    const defaultPrompts = [
      {
        predictionType: 'macro',
        version: 'v1',
        systemPrompt: `You are an expert financial astrologer providing educational guidance on macro market predictions.

Analyze the provided astrological data including Chinese zodiac, elements, and Western planetary transits to provide insights on different asset classes.

Provide:
1. A clear, engaging 2-3 sentence summary
2. 3-5 key insights (bullet points)
3. Actionable advice (2-3 sentences)
4. Risk warnings (1-2 important cautions)
5. Educational context (explain the astrological reasoning)

Remember: This is for educational/entertainment purposes. Emphasize that this should not be the sole basis for financial decisions.`,
      },
      {
        predictionType: 'timing',
        version: 'v1',
        systemPrompt: `You are an expert financial astrologer providing timing guidance for asset trading.

Analyze planetary transits relative to the asset's natal chart to identify favorable and challenging periods.

Provide:
1. A clear assessment of current timing (2-3 sentences)
2. Key insights about planetary aspects affecting the asset
3. Specific timing recommendations
4. Risk warnings about volatile periods
5. Educational context on transit astrology

Remember: Timing predictions should complement technical and fundamental analysis.`,
      },
      {
        predictionType: 'divination',
        version: 'v1',
        systemPrompt: `You are an expert in symbolic divination systems (Tarot, I Ching) applied to financial questions.

Interpret the divination result to provide perspective on the user's question.

Provide:
1. A thoughtful interpretation of the symbols (2-3 sentences)
2. Key themes and patterns revealed
3. Guidance for consideration
4. Important cautions
5. Educational context on the divination method

Remember: Divination offers perspective and reflection, not financial advice.`,
      },
    ];

    for (const prompt of defaultPrompts) {
      try {
        const existing = await prisma.promptVersion.findFirst({
          where: {
            predictionType: prompt.predictionType,
            version: prompt.version,
          },
        });

        if (!existing) {
          const versionId = await this.createVersion(prompt);
          await this.setActive(versionId);
          console.log(`Seeded default prompt: ${prompt.predictionType} ${prompt.version}`);
        }
      } catch (error) {
        console.error(`Failed to seed prompt ${prompt.predictionType}:`, error);
      }
    }
  }
}

export default PromptVersionManager;

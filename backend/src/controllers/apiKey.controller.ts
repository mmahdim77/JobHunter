import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getApiKeys = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        openaiApiKey: true,
        grokApiKey: true,
        deepseekApiKey: true,
        geminiApiKey: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateApiKeys = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { openaiApiKey, grokApiKey, deepseekApiKey, geminiApiKey } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        openaiApiKey,
        grokApiKey,
        deepseekApiKey,
        geminiApiKey
      },
      select: {
        openaiApiKey: true,
        grokApiKey: true,
        deepseekApiKey: true,
        geminiApiKey: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating API keys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 
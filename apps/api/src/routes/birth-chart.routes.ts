/**
 * Birth Chart Routes
 * API endpoints for astrological birth chart generation and retrieval
 */

import express, { Request, Response } from 'express';
import birthChartService from '../services/birth-chart.service';
import logger from '../utils/logger';

const router = express.Router();

/**
 * POST /v1/users/:userId/birth-chart
 * Generate and store user's birth chart
 */
router.post('/users/:userId/birth-chart', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    logger.info('Generating birth chart for user', { userId });

    const birthChart = await birthChartService.generateUserBirthChart(userId);

    res.status(201).json({
      success: true,
      data: birthChart,
    });
  } catch (error: any) {
    logger.error('Error generating user birth chart', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'BIRTH_CHART_GENERATION_FAILED',
        message: error.message || 'Failed to generate birth chart',
      },
    });
  }
});

/**
 * GET /v1/users/:userId/birth-chart
 * Retrieve user's birth chart
 */
router.get('/users/:userId/birth-chart', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    logger.info('Fetching birth chart for user', { userId });

    const birthChart = await birthChartService.getUserBirthChart(userId);

    res.status(200).json({
      success: true,
      data: birthChart,
    });
  } catch (error: any) {
    logger.error('Error fetching user birth chart', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'BIRTH_CHART_FETCH_FAILED',
        message: error.message || 'Failed to fetch birth chart',
      },
    });
  }
});

/**
 * POST /v1/assets/:assetId/birth-chart
 * Generate and store asset's birth chart
 */
router.post('/assets/:assetId/birth-chart', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;

    logger.info('Generating birth chart for asset', { assetId });

    const birthChart = await birthChartService.generateAssetBirthChart(assetId);

    res.status(201).json({
      success: true,
      data: birthChart,
    });
  } catch (error: any) {
    logger.error('Error generating asset birth chart', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'ASSET_BIRTH_CHART_GENERATION_FAILED',
        message: error.message || 'Failed to generate asset birth chart',
      },
    });
  }
});

/**
 * GET /v1/assets/:assetId/birth-chart
 * Retrieve asset's birth chart
 */
router.get('/assets/:assetId/birth-chart', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;

    logger.info('Fetching birth chart for asset', { assetId });

    const birthChart = await birthChartService.getAssetBirthChart(assetId);

    res.status(200).json({
      success: true,
      data: birthChart,
    });
  } catch (error: any) {
    logger.error('Error fetching asset birth chart', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'ASSET_BIRTH_CHART_FETCH_FAILED',
        message: error.message || 'Failed to fetch asset birth chart',
      },
    });
  }
});

/**
 * POST /v1/compatibility/:userId/:assetId
 * Calculate compatibility between user and asset
 */
router.post('/compatibility/:userId/:assetId', async (req: Request, res: Response) => {
  try {
    const { userId, assetId } = req.params;

    logger.info('Calculating compatibility', { userId, assetId });

    const compatibility = await birthChartService.calculateUserAssetCompatibility(userId, assetId);

    res.status(200).json({
      success: true,
      data: compatibility,
    });
  } catch (error: any) {
    logger.error('Error calculating compatibility', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'COMPATIBILITY_CALCULATION_FAILED',
        message: error.message || 'Failed to calculate compatibility',
      },
    });
  }
});

/**
 * GET /v1/compatibility/:userId/:assetId
 * Retrieve cached compatibility data
 */
router.get('/compatibility/:userId/:assetId', async (req: Request, res: Response) => {
  try {
    const { userId, assetId } = req.params;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    logger.info('Fetching compatibility', { userId, assetId });

    const compatibility = await prisma.userAssetCompatibility.findUnique({
      where: {
        userId_assetId: {
          userId,
          assetId,
        },
      },
    });

    if (!compatibility) {
      // Calculate if not found
      const newCompatibility = await birthChartService.calculateUserAssetCompatibility(
        userId,
        assetId
      );

      return res.status(200).json({
        success: true,
        data: newCompatibility,
      });
    }

    res.status(200).json({
      success: true,
      data: compatibility,
    });
  } catch (error: any) {
    logger.error('Error fetching compatibility', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'COMPATIBILITY_FETCH_FAILED',
        message: error.message || 'Failed to fetch compatibility',
      },
    });
  }
});

/**
 * GET /v1/birth-chart/test
 * Test endpoint to verify birth chart generation works
 */
router.get('/test', async (req: Request, res: Response) => {
  try {
    const { generateBirthChart } = require('@astro/astro-core');

    logger.info('Testing birth chart generation');

    // Test with a known birth date
    const testChart = generateBirthChart(
      new Date('1990-05-15'),
      14, // 2:30 PM
      30,
      {
        latitude: 40.7128,
        longitude: -74.006,
        city: 'New York',
        country: 'USA',
      }
    );

    res.status(200).json({
      success: true,
      message: 'Birth chart engine is working',
      sample: {
        birthDate: '1990-05-15',
        birthTime: '14:30',
        location: 'New York, USA',
        chinese: {
          zodiacAnimal: testChart.chinese.zodiacAnimal,
          element: testChart.chinese.baziChart.dayMaster,
          luckyNumbers: testChart.chinese.luckyNumbers,
        },
        western: {
          sunSign: testChart.western.sunSign,
          moonSign: testChart.western.moonSign,
          risingSign: testChart.western.risingSign,
        },
      },
    });
  } catch (error: any) {
    logger.error('Error testing birth chart', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'TEST_FAILED',
        message: error.message || 'Test failed',
        stack: error.stack,
      },
    });
  }
});

export default router;

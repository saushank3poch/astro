'use client';

import { motion } from 'framer-motion';
import type { ChineseElement } from '@/types';
import type { ElementRelationship } from '@/types/compatibility';

interface ElementHarmonyDiagramProps {
  userElements: ChineseElement[];
  assetElements: ChineseElement[];
  relationship: ElementRelationship;
}

const ELEMENT_INFO = {
  metal: { emoji: '⚙️', color: '#C0C0C0', name: 'Metal' },
  wood: { emoji: '🌳', color: '#22C55E', name: 'Wood' },
  water: { emoji: '💧', color: '#3B82F6', name: 'Water' },
  fire: { emoji: '🔥', color: '#EF4444', name: 'Fire' },
  earth: { emoji: '⛰️', color: '#A16207', name: 'Earth' },
};

const RELATIONSHIP_INFO = {
  productive: {
    color: '#22C55E',
    label: 'Productive Cycle',
    description: 'Elements support and nourish each other',
  },
  reductive: {
    color: '#F59E0B',
    label: 'Reductive Cycle',
    description: 'Elements reduce each other moderately',
  },
  controlling: {
    color: '#EF4444',
    label: 'Controlling Cycle',
    description: 'One element controls or restricts the other',
  },
  insulting: {
    color: '#DC2626',
    label: 'Insulting Cycle',
    description: 'Strong conflict between elements',
  },
  neutral: {
    color: '#9CA3AF',
    label: 'Neutral',
    description: 'No strong interaction between elements',
  },
};

export function ElementHarmonyDiagram({
  userElements,
  assetElements,
  relationship,
}: ElementHarmonyDiagramProps) {
  const relationshipInfo = RELATIONSHIP_INFO[relationship];

  return (
    <div className="space-y-6">
      {/* Relationship Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div
          className="inline-block px-4 py-2 rounded-full mb-2"
          style={{ backgroundColor: `${relationshipInfo.color}20`, border: `2px solid ${relationshipInfo.color}40` }}
        >
          <span className="font-bold" style={{ color: relationshipInfo.color }}>
            {relationshipInfo.label}
          </span>
        </div>
        <p className="text-sm text-cosmic-silver/70">{relationshipInfo.description}</p>
      </motion.div>

      {/* Visual Diagram */}
      <div className="flex items-center justify-center gap-8">
        {/* User Elements */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="text-sm font-medium text-cosmic-silver/70 mb-2">Your Elements</div>
          <div className="flex flex-wrap gap-3 justify-center max-w-[200px]">
            {userElements.map((element, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="relative group"
              >
                <div
                  className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 shadow-lg"
                  style={{
                    backgroundColor: `${ELEMENT_INFO[element].color}20`,
                    borderColor: ELEMENT_INFO[element].color,
                  }}
                >
                  <div className="text-3xl mb-1">{ELEMENT_INFO[element].emoji}</div>
                  <div className="text-xs font-semibold" style={{ color: ELEMENT_INFO[element].color }}>
                    {ELEMENT_INFO[element].name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Relationship Arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <svg width="80" height="80" viewBox="0 0 80 80">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3, 0 6"
                  fill={relationshipInfo.color}
                />
              </marker>
            </defs>
            <motion.path
              d="M 10 40 L 70 40"
              stroke={relationshipInfo.color}
              strokeWidth="3"
              fill="none"
              markerEnd="url(#arrowhead)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </svg>
        </motion.div>

        {/* Asset Elements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="text-sm font-medium text-cosmic-silver/70 mb-2">Asset Elements</div>
          <div className="flex flex-wrap gap-3 justify-center max-w-[200px]">
            {assetElements.map((element, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="relative group"
              >
                <div
                  className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 shadow-lg"
                  style={{
                    backgroundColor: `${ELEMENT_INFO[element].color}20`,
                    borderColor: ELEMENT_INFO[element].color,
                  }}
                >
                  <div className="text-3xl mb-1">{ELEMENT_INFO[element].emoji}</div>
                  <div className="text-xs font-semibold" style={{ color: ELEMENT_INFO[element].color }}>
                    {ELEMENT_INFO[element].name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Five Elements Cycle Reference */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 p-4 rounded-lg bg-cosmic-deep/30 border border-cosmic-violet/20"
      >
        <div className="text-xs text-cosmic-silver/70 text-center">
          <div className="font-semibold mb-2 text-cosmic-violet">Five Elements Cycles</div>
          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <span className="text-green-400">Productive:</span> Wood → Fire → Earth → Metal → Water
            </div>
            <div>
              <span className="text-red-400">Controlling:</span> Wood → Earth → Water → Fire → Metal
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

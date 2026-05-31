import React from 'react';
import { motion } from 'framer-motion';

interface CharacterSpriteProps {
  type: 'cewek' | 'robot';
  pose: number; // 0, 1, 2, 3
  size?: number;
  flip?: boolean;
}

/**
 * CharacterSprite handles PNG spritesheets for Cewek and Robot.
 * FIXED: Larger viewport and precise positioning to prevent clipping.
 */
export function CharacterSprite({
  type,
  pose,
  size = 200,
  flip = false,
}: CharacterSpriteProps) {
  const spriteUrl = type === 'cewek' ? '/cewek_4_pose.png' : '/robot_4_pose.png';
  
  let backgroundPosition = '';
  let backgroundSize = '200% 200%';
  let scale = 1;

  // We use a larger container but keep the sprite smaller inside to prevent edge clipping
  const innerSize = size * 0.9;

  if (type === 'cewek') {
    // Precise positions based on the 4-pose collage
    const positions = [
      '50% 5%',    // Pose 0: Top Center
      '2% 95%',    // Pose 1: Middle Left (Hi!)
      '50% 98%',   // Pose 2: Bottom Center
      '98% 95%',   // Pose 3: Middle Right (Victory)
    ];
    backgroundPosition = positions[pose % 4];
    backgroundSize = '240% 240%'; 
    scale = 1.2;
  } else {
    // 2x2 grid for robot
    const posX = (pose % 2) * 100;
    const posY = Math.floor(pose / 2) * 100;
    backgroundPosition = `${posX}% ${posY}%`;
    backgroundSize = '200% 200%';
  }

  return (
    <div style={{ 
      width: size, 
      height: size, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      overflow: 'visible' // Ensure animations don't clip
    }}>
      <motion.div
        style={{
          width: innerSize,
          height: innerSize,
          backgroundImage: `url("${spriteUrl}")`,
          backgroundSize: backgroundSize,
          backgroundPosition: backgroundPosition,
          backgroundRepeat: 'no-repeat',
          transform: `${flip ? 'scaleX(-1)' : ''} scale(${scale})`,
          imageRendering: 'crisp-edges',
        }}
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, 0.5, -0.5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
    </div>
  );
}

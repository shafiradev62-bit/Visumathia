import vimoIdle from './vimo_idle.png';
import vimoCelebrate from './vimo_celebrate.png';
import scene1 from './scene1_portal.png';
import scene2 from './scene2_bedroom.png';
import scene3 from './scene3_playground.png';
import scene4 from './scene4_kitchen.png';
import scene5 from './scene5_classroom.png';
import scene6 from './scene6_market.png';
import scene7 from './scene7_city.png';
import scene8 from './scene8_construction.png';

export const sprites = {
  vimo: { idle: vimoIdle, celebrate: vimoCelebrate },
  scenes: [
    scene1, scene2, scene3, scene4, scene5,
    scene6, scene7, scene8,
  ],
} as const;

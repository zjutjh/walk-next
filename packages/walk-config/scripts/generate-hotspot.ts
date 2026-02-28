/**
 *
 *
 * 生成热区配置文件模板
 *
 *
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import isValidFilename from "valid-filename";

import {
  WALK_CAMPUS_ID_LIST,
  WALK_CAMPUS_POINT_ID_MAP,
  WALK_CAMPUS_SEGMENT_KEY_MAP,
  type WalkPointId,
  type WalkSegmentKey
} from "../src/index";

/** 生成目录（相对于src文件夹） */
const GENERATE_DIR = "./hotspots";

/** 生成点位模板文件 */
const generatePointTemplate = (filePath: string, pointId: WalkPointId) => {
  /** 文件内容 */
  const templateHTML = `// CSpell:disable
export default \`<div
  class="jh-walk-hotspot point"
  data-point-id="${pointId}"
></div>\`;
`;
  // 写入文件
  fs.writeFileSync(filePath, templateHTML);
};

/** 生成行程段模板文件 */
const generateSegmentTemplate = (filePath: string, segmentKey: WalkSegmentKey) => {
  /** 文件内容 */
  const templateHTML = `// CSpell:disable
export default \`<div
  class="jh-walk-hotspot segment"
  data-jh-walk-segment-ley="${segmentKey}"
  style="transform: rotateZ(0deg);"
></div>\`;\n
`;
  // 写入文件
  fs.writeFileSync(filePath, templateHTML);
};

try {
  /** 当前文件位置 */
  const ScriptDir = path.dirname(fileURLToPath(import.meta.url));
  /** 生成目录位置 */
  const targetDir = path.join(ScriptDir, "../src", GENERATE_DIR);

  /**
   * 生成
   */

  // 遍历校区ID
  for (const campusId of WALK_CAMPUS_ID_LIST) {
    if (!isValidFilename(campusId)) {
      throw new Error(`校区ID无法作为目录名，请修改校区ID: ${campusId}`);
    }

    /** 点位目录 */
    const pointsDir = path.join(targetDir, campusId, "./points");
    // 创建目录
    if (!fs.existsSync(pointsDir)) {
      console.info(`创建目录${pointsDir}...`);
      fs.mkdirSync(pointsDir, { recursive: true });
      console.info(`${pointsDir} 已创建`);
    } else {
      console.info(`${pointsDir} 已存在`);
    }

    // 遍历点位ID
    for (const pointId of WALK_CAMPUS_POINT_ID_MAP[campusId]) {
      if (!isValidFilename(pointId)) {
        throw new Error(`点位ID无法作为文件名，请修改点位ID: ${pointId}`);
      }

      /** 热区模板文件路径 */
      const filePath = path.join(pointsDir, `./${pointId}.ts`);
      if (!fs.existsSync(filePath)) {
        console.info(`创建点位模板文件${filePath}...`);

        // 填入模板内容
        generatePointTemplate(filePath, pointId as WalkPointId);

        console.info(`点位模板文件${filePath} 已创建`);
      } else {
        console.error(
          `无法创建模板文件${filePath} 因为文件已经存在。如果文件内容是陈旧的，请先删除或移动旧文件！`
        );
      }
    }

    // 遍历行程段key
    for (const segmentKey of WALK_CAMPUS_SEGMENT_KEY_MAP[campusId]) {
      if (!isValidFilename(segmentKey)) {
        throw new Error(`行程段key无法作为文件名，请修改点位ID或行程段key分隔符: ${segmentKey}`);
      }

      /** 热区模板文件路径 */
      const filePath = path.join(pointsDir, `./${segmentKey}.ts`);
      if (!fs.existsSync(filePath)) {
        console.info(`创建行程段模板文件${filePath}...`);

        // 填入模板内容
        generateSegmentTemplate(filePath, segmentKey as WalkSegmentKey);

        console.info(`行程段模板文件${filePath} 已创建`);
      } else {
        console.error(
          `无法创建行程段模板文件${filePath} 因为文件已经存在。如果文件内容是陈旧的，请先删除或移动旧文件！`
        );
      }
    }
  }
} catch (err) {
  console.error(`生成热区配置文件模板失败: ${(err as Error).message}`);
}

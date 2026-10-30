import image0 from "../public/images/heroes/cao-cao.jpg";
import image1 from "../public/images/heroes/chongzhen.jpg";
import image2 from "../public/images/heroes/diao-chan.jpg";
import image3 from "../public/images/heroes/jiajing.jpg";
import image4 from "../public/images/heroes/sima-yi.jpg";
import image5 from "../public/images/heroes/song-shenzong.jpg";
import image6 from "../public/images/heroes/yongzheng.jpg";
import image7 from "../public/images/heroes/zhang-liang.jpg";
import image8 from "../public/images/heroes/zhao-kuangyin.jpg";
export const assets = {"images/heroes/cao-cao.jpg":image0,"images/heroes/chongzhen.jpg":image1,"images/heroes/diao-chan.jpg":image2,"images/heroes/jiajing.jpg":image3,"images/heroes/sima-yi.jpg":image4,"images/heroes/song-shenzong.jpg":image5,"images/heroes/yongzheng.jpg":image6,"images/heroes/zhang-liang.jpg":image7,"images/heroes/zhao-kuangyin.jpg":image8};
export const externalPaths = ["images/heroes/cixi.jpg", "images/heroes/han-xin.jpg", "images/heroes/huo-qubing.jpg", "images/heroes/jing-ke.jpg", "images/heroes/wang-jian.jpg", "images/heroes/wang-yangming.jpg", "images/heroes/wu-zetian.jpg", "images/heroes/yue-fei.jpg", "images/heroes/yulinxiu.jpg", "images/heroes/zhang-jue.jpg", "images/heroes/zhou-gong.jpg", "images/heroes/zhuge-liang.jpg", "images/scenarios/beijiu.jpg", "images/scenarios/daliyi.jpg", "images/scenarios/diaochan.jpg", "images/scenarios/diaoyu.jpg", "images/scenarios/eight_nations.jpg", "images/scenarios/fenglang.jpg", "images/scenarios/gaoping.jpg", "images/scenarios/longchang.jpg", "images/scenarios/ming.jpg", "images/scenarios/nine_dragons.jpg", "images/scenarios/northern_expedition.jpg", "images/scenarios/tutorial.jpg", "images/scenarios/xining.jpg", "images/scenarios/yuefei.jpg", "images/scenarios/zhougong.jpg"];
export async function loadAssets(files) {
  if (!files?.get) throw new Error("文件服务尚未就绪");
  await Promise.all(externalPaths.map(async path => { const response = await files.get("template-assets/" + path); if (!response.ok) throw new Error("素材读取失败：" + path); assets[path] = URL.createObjectURL(await response.blob()); }));
}

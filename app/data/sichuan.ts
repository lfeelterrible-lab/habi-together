export type NavigationItem = {
  id: string;
  number: string;
  label: string;
};

export const navigationItems: NavigationItem[] = [
  { id: 'position', number: '01', label: '位置' },
  { id: 'terrain', number: '02', label: '地形' },
  { id: 'climate', number: '03', label: '气候' },
  { id: 'light', number: '04', label: '光照' },
  { id: 'agriculture', number: '05', label: '农业' },
  { id: 'comparison', number: '06', label: '区域比较' },
  { id: 'mistakes', number: '07', label: '易错点' },
  { id: 'exam', number: '08', label: '高考题' },
  { id: 'quiz', number: '09', label: '自测' },
  { id: 'summary', number: '10', label: '总结' },
];

export const quickFacts = [
  { label: '地区', value: '中国西南' },
  { label: '主要省级行政区', value: '四川、重庆' },
  { label: '地形类型', value: '盆地' },
  { label: '气候', value: '亚热带季风气候' },
  { label: '代表城市', value: '成都、重庆' },
];

export const climateRows = [
  { label: '夏季', value: '高温多雨' },
  { label: '冬季', value: '相对温和' },
  { label: '降水', value: '较丰富' },
  { label: '湿度', value: '较大' },
  { label: '云量', value: '较多' },
  { label: '日照', value: '相对较少' },
];

export const lightCauseLayers = [
  {
    number: '01',
    title: '地形原因',
    tone: 'blue',
    paragraphs: [
      '四川盆地四周多山地，内部地势较低，地形相对封闭。',
      '空气流通和水汽扩散受到一定影响。',
    ],
  },
  {
    number: '02',
    title: '水汽条件',
    tone: 'green',
    paragraphs: [
      '四川盆地属于亚热带季风气候区，水汽条件较好。',
      '空气湿度相对较大。',
    ],
  },
  {
    number: '03',
    title: '云雾',
    tone: 'orange',
    paragraphs: [
      '水汽丰富，加上盆地地形等条件，云、雾天气相对较多。',
    ],
  },
  {
    number: '04',
    title: '太阳辐射',
    tone: 'ink',
    paragraphs: [
      '云层和水汽会增强大气对太阳辐射的吸收、反射和散射。',
      '因此，到达地面的太阳辐射减少。',
    ],
  },
] as const;

export const agriculturalAdvantages = [
  '热量较充足',
  '降水较丰富',
  '水源较充足',
  '成都平原等地区地形较平坦',
  '土壤条件较好',
  '人口和劳动力较集中',
];

export const agriculturalLimits = [
  '部分地区光照相对不足',
  '部分地区地形起伏较大',
  '可能受到洪涝等自然灾害影响',
];

export const heatLightRows = [
  { label: '热量', value: '温度条件、积温、生长期等' },
  { label: '光照', value: '日照时间、太阳辐射等' },
];

export const commonMistakes = [
  {
    number: '01',
    error: '四川盆地太阳辐射弱，因为它距离太阳比较远。',
    why: '地球不同地区与太阳之间的距离差异，不是解释这种区域太阳辐射差异的主要因素。',
    correct: '应从地形、水汽、云雾和大气削弱作用入手。',
  },
  {
    number: '02',
    error: '四川盆地热量不足。',
    why: '四川盆地纬度较低，属于亚热带季风气候，总体热量条件较好。',
    correct: '真正相对不足的是光照，而不是热量。',
  },
  {
    number: '03',
    error: '四川盆地太阳辐射少就是因为降水多。',
    why: '“降水多”只是现象之一，答案还缺少水汽转化为云雾以及大气削弱的过程。',
    correct: '水汽 → 云雾 → 大气削弱 → 太阳辐射减少。',
  },
  {
    number: '04',
    error: '太阳辐射弱，所以四川盆地很冷。',
    why: '太阳辐射、气温和热量条件有关联，但不能简单画等号。',
    correct: '四川盆地仍然可以温暖湿润，热量条件总体较好。',
  },
];

export const comparisonSides = [
  {
    key: 'basin',
    label: '四川盆地',
    tone: 'blue',
    points: [
      '海拔相对较低',
      '水汽较丰富',
      '空气湿度较大',
      '云雾较多',
      '大气削弱作用较强',
      '太阳辐射相对较弱',
    ],
  },
  {
    key: 'plateau',
    label: '青藏高原',
    tone: 'green',
    points: [
      '海拔高',
      '空气较稀薄',
      '大气透明度较高',
      '晴天相对较多',
      '大气削弱作用相对较弱',
      '太阳辐射较强',
    ],
  },
] as const;

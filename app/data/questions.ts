export type ExamQuestionData = {
  id: string;
  type: string;
  title: string;
  thought: string;
  answer: string;
};

export const examQuestions: ExamQuestionData[] = [
  {
    id: 'radiation',
    type: '题型 01',
    title: '分析四川盆地太阳辐射较弱的原因。',
    thought: '先定位自然条件，再按“地形 → 水汽 → 云雾 → 太阳辐射”的顺序组织过程。',
    answer: '四川盆地四周多山地，地形相对封闭，空气流通和水汽扩散受到一定影响；该地区水汽较丰富，空气湿度较大，云雾天气较多；云层和水汽对太阳辐射的削弱作用较强，因此到达地面的太阳辐射较少，日照时间相对较短。',
  },
  {
    id: 'compare',
    type: '题型 02',
    title: '比较四川盆地和青藏高原太阳辐射的差异。',
    thought: '比较题要同时写出两地条件，并落到“大气削弱作用”的差异。',
    answer: '四川盆地海拔较低、水汽较丰富、云雾较多，大气削弱作用较强，太阳辐射相对较弱；青藏高原海拔高，空气稀薄，大气透明度较高，晴天相对较多，大气削弱作用较弱，太阳辐射较强。',
  },
  {
    id: 'agriculture',
    type: '题型 03',
    title: '评价四川盆地农业生产的自然条件。',
    thought: '评价要一分为二：先写热量、水分、地形等有利条件，再补充光照和灾害等限制。',
    answer: '有利条件是热量较充足、降水较丰富、水源较充足，成都平原等地地形较平坦，土壤条件较好；限制因素是部分地区光照相对不足、地形起伏较大，且可能受到洪涝等自然灾害影响。总体而言，四川盆地农业自然条件较好。',
  },
  {
    id: 'fog',
    type: '题型 04',
    title: '解释四川盆地云雾天气较多的原因。',
    thought: '从盆地的封闭地形和亚热带季风气候的水汽条件入手，说明湿度大与水汽不易扩散。',
    answer: '四川盆地四周多山地，地形相对封闭，空气流通和水汽扩散受到一定影响；同时属于亚热带季风气候区，水汽条件较好，空气湿度较大，因此云雾天气相对较多。',
  },
];

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: { label: string; text: string }[];
  answer: string;
  explanation: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'climate',
    prompt: '四川盆地主要属于什么气候？',
    options: [
      { label: 'A', text: '温带季风气候' },
      { label: 'B', text: '亚热带季风气候' },
      { label: 'C', text: '热带季风气候' },
      { label: 'D', text: '温带大陆性气候' },
    ],
    answer: 'B',
    explanation: '四川盆地位于亚热带季风气候区，热量较好、降水较丰富。',
  },
  {
    id: 'cloud',
    prompt: '四川盆地太阳辐射较弱的主要原因之一是：',
    options: [
      { label: 'A', text: '距离太阳更远' },
      { label: 'B', text: '纬度特别高' },
      { label: 'C', text: '云雾天气较多' },
      { label: 'D', text: '地球自转较慢' },
    ],
    answer: 'C',
    explanation: '云层和水汽会吸收、反射、散射太阳辐射，增强大气削弱作用。',
  },
  {
    id: 'heat-light',
    prompt: '四川盆地“热量条件”和“光照条件”的正确描述是：',
    options: [
      { label: 'A', text: '热量差、光照强' },
      { label: 'B', text: '热量较好、光照相对不足' },
      { label: 'C', text: '热量和光照都很差' },
      { label: 'D', text: '两者完全相同' },
    ],
    answer: 'B',
    explanation: '四川盆地总体温暖湿润，热量较充足；但云雾较多，光照相对不足。',
  },
  {
    id: 'plateau',
    prompt: '青藏高原太阳辐射较强，主要得益于：',
    options: [
      { label: 'A', text: '海拔高、空气稀薄' },
      { label: 'B', text: '降水特别丰富' },
      { label: 'C', text: '盆地封闭' },
      { label: 'D', text: '云量较多' },
    ],
    answer: 'A',
    explanation: '青藏高原海拔高，空气稀薄，大气透明度较高，太阳辐射削弱较少。',
  },
  {
    id: 'logic',
    prompt: '下列哪条因果链更完整？',
    options: [
      { label: 'A', text: '降水多 → 太阳辐射少' },
      { label: 'B', text: '水汽丰富 → 云雾较多 → 大气削弱增强 → 太阳辐射减少' },
      { label: 'C', text: '距离太阳远 → 光照不足' },
      { label: 'D', text: '盆地 → 热量不足 → 光照不足' },
    ],
    answer: 'B',
    explanation: '综合题要写出中间过程，水汽、云雾和大气削弱作用共同构成完整逻辑。',
  },
];

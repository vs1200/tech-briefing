export const CATEGORIES = [
  { slug: 'llm', name: 'AI モデル・LLM', description: '新モデル、オープンウェイト、ローカル LLM、推論 API' },
  { slug: 'agents', name: 'AI エージェント', description: 'エージェントの仕組み、MCP、Agent Skills、運用事例' },
  { slug: 'dev-tools', name: 'Coding Agent・開発ツール', description: 'Claude Code、Codex、Copilot、IDE、CLI、CI' },
  { slug: 'gamedev', name: 'ゲーム開発・Unity', description: 'Unity、Godot、Unreal、ゲーム開発と AI' },
  { slug: 'graphics', name: 'グラフィックス・XR', description: 'WebGPU、レンダリング、アップスケーリング、XR' },
  {
    slug: 'languages',
    name: 'Web・プログラミング言語',
    description: 'ブラウザ、フロントエンド、Go、Rust、Kotlin など',
  },
  { slug: 'infra', name: 'インフラ・クラウド', description: 'AWS、Google Cloud、Cloudflare、Kubernetes' },
  { slug: 'security', name: 'セキュリティ', description: 'AI セキュリティ、サプライチェーン攻撃、脆弱性' },
  { slug: 'oss-research', name: 'OSS・研究', description: '注目の OSS、論文、ベンチマーク' },
  { slug: 'industry', name: '業界動向', description: '買収、資金調達、企業の発表、ハードウェア' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];

export function getCategory(slug: CategorySlug): Category {
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) throw new Error(`Unknown category: ${slug}`);
  return category;
}

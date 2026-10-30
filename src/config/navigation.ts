import { BookOpen, Bomb, Globe, Map, FlaskConical, TrendingUp, Ticket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'weapons', path: '/weapons', icon: Bomb, isContentType: true },
	{ key: 'countries', path: '/countries', icon: Globe, isContentType: true },
	{ key: 'map', path: '/map', icon: Map, isContentType: true },
	{ key: 'simulation', path: '/simulation', icon: FlaskConical, isContentType: true },
	{ key: 'progression', path: '/progression', icon: TrendingUp, isContentType: true },
	{ key: 'codes', path: '/codes', icon: Ticket, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移开头的 '/' -> ['guide', 'weapons', 'countries', 'map', 'simulation', 'progression', 'codes']

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}

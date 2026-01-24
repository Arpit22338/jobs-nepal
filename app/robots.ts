import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/teacher/dashboard/', '/profile/edit/'],
        },
        sitemap: 'https://rojgaarnepal.com/sitemap.xml',
    }
}

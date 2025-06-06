import {type DefaultTheme, defineConfig} from 'vitepress'
import fs from 'fs'
import {NavItemWithChildren, NavItemWithLink, SidebarItem, SidebarMulti} from "vitepress/types/default-theme";

const fileList = readFileSync('./docs/articles')

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "DN Blog",
    description: "DN's Blog",

    lastUpdated: true,
    cleanUrls: true,
    metaChunk: true,

    ignoreDeadLinks: true,

    head:[
        ['link', { rel: 'icon', type: 'image/png', href: '/vitepress-logo-mini.png' }],
    ],



    themeConfig: {
        logo: { src: '/vitepress-logo-mini.svg', width: 24, height: 24 },

        search: {
            provider: 'local'
        },

        nav: nav(fileList),

        sidebar: sidebar(fileList),

        editLink: {
            pattern: 'https://github.com/DingN03/DingN03.github.io/tree/main/docs/:path',
            text: '在 GitHub 上编辑此页面'
        },

        footer: {
            message: '基于 MIT 许可发布',
            copyright: `版权所有 © 2019-${new Date().getFullYear()} DN`
        },

        docFooter: {
            prev: '上一页',
            next: '下一页'
        },

        outline: {
            label: '页面导航'
        },

        lastUpdated: {
            text: '最后更新于',
            formatOptions: {
                dateStyle: 'short',
                timeStyle: 'medium'
            }
        },

        socialLinks: [
            {icon: 'github', link: 'https://github.com/DingN03'}
        ],

        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式'
    }
})


function readFileSync(file: string): any[] {
    const dirs = fs.readdirSync(file)
    return dirs.map(dir => {
        if (dir.match(/\.md$/)) {
            return {
                fileName: dir.substring(dir.lastIndexOf("\/")+1, dir.lastIndexOf(".")),
                fileType: 'file',
                filePath: file + '/' + dir
            }
        } else {
            return {
                fileName: dir,
                fileType: 'dir',
                filePath: file + '/' + dir,
                children: readFileSync(file + '/' + dir)
            }
        }
    })
}


function nav(fileList: any[]) {
    return fileListToNav(fileList)
}

// 读取文件列表并转换为导航结构
function fileListToNav(fileList: any[]): NavItemWithLink[] | NavItemWithChildren[]    {
    return fileList.map(file => {
        if (file.fileType === 'dir') {
            return {
                text: file.fileName,
                items: fileListToNav(file.children)
            }
        } else {
            const fileName = file.fileName.indexOf('_') !== 0? file.fileName.slice( file.fileName.indexOf('_')+1) : file.fileName
            return {
                text: fileName,
                link: file.filePath.replace('./docs/articles', '/articles').replace('.md', '')
            }
        }
    })
}



function fileListToSidebar(fileList: any[]): SidebarItem[]  {
    return fileList.map(file => {
        if (file.fileType === 'dir') {
            return {
                text: file.fileName,
                collapsable: false,
                base: file.filePath.replace('./docs/articles', '/articles') + '/',
                items: fileListToSidebar(file.children)
            }
        } else {
            const fileName = file.fileName.indexOf('_') !== 0? file.fileName.slice( file.fileName.indexOf('_')+1) : file.fileName
            return {
                text: fileName,
                link: file.fileName
            }
        }
    })
}

function sidebar(fileList: any[]): SidebarMulti {

    const sidebarMulti = {}

    fileListToSidebar(fileList).forEach(item => {
        sidebarMulti[item.base] = {
            base: item.base,
            items: item.items
        }
    })

    sidebarMulti['/install/'] = [
        {
            text: 'VitePress 安装指南',
            base: '/install/vitepress-',
            items: [
                {
                    text: '安装',
                    link: 'install'
                },
                {
                    text: '配置',
                    link: 'config'
                },
                {
                    text: '部署',
                    link: 'deploy'
                },
            ]
        }
   ]

    return sidebarMulti
}




# VitePress 配置

## 配置

> [!tip] 
> 我这里先附带上自己的配置文件，供参考。
> 
> 也可以参考官方地址：[VitePress 配置](https://vitepress.dev/zh/reference/site-config)
  
> [!warning] 注意
> 如果你要使用我的配置文件，请确保目录结构和我的一致，特别是 `./docs/articles` 目录存在
> 
> 并且在 目录下存在一定的目录或md文件，


::: details config.mts
```ts:line-numbers
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

// 读取文件列表
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
// 获取导航栏列表
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
            return {
                text: file.fileName,
                link: file.filePath.replace('./docs/articles', '/articles').replace('.md', '')
            }
        }
    })
}

// 获取侧边栏列表
function sidebar(fileList: any[]): SidebarMulti {
    const sidebarMulti = {}
    fileListToSidebar(fileList).forEach(item => {
        sidebarMulti[item.base] = {
            base: item.base,
            items: item.items
        }
    })
    return sidebarMulti
}

// 读取文件列表并转换为侧边栏结构
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
            return {
                text: file.fileName,
                link: file.fileName
            }
        }
    })
}

```
:::

## 说明

| 行号 | 配置项 | 说明                        |
|----|-------|---------------------------|
| 9  | title | 网站标题                      |
| 10 | description | 网站描述                      |
| 19 | logo | 网站图标,对应站点左上角的图标           |
| 25 | nav | 导航栏配置,对应站点顶部的导航栏，会在下方详细说明 |
| 27 | sidebar | 侧边栏配置,对应站点左侧的侧边栏，会在下方详细说明 |
| 56 | sociaLinks | 社交链接配置,对应站点右上角的社交链接 |

## 配置代码说明

`readFileSync()` 函数用来读取文件列表，并为后续自动转为导航栏和侧边栏做准备。

`nav()` 函数用来将文件列表转换为导航栏结构。如果想在自动读取的基础上做一定的变更，可以修改此函数。

> 读取会以 `articles/` 下的所有目录和md文件作为导航栏的项目。
> 以 `articles/linux` 目录为例，其对应的导航栏项目为 `linux` 。
> 建议不要超过2层目录（一层最好），否则可能会导致导航栏过于复杂。
> 
> 如果想在自动读取的基础上做一定的变更，可以修改此函数。

`fileListToNav()` 函数用来读取文件列表并转换为导航栏数据结构。

`sidebar()` 函数用来将文件列表转换为侧边栏结构，我在此出做了修改，读取到的第一层目录将作为组，子目录则属于该组。

>如 `articles/linux` 会将 `linux` 目录视为一组,
>其下的文章将作为该组的子项。
>
>如果想在自动读取的基础上做一定的变更，可以修改此函数。

`fileListToSidebar()` 函数用来读取文件列表并转换为侧边栏数据结构。



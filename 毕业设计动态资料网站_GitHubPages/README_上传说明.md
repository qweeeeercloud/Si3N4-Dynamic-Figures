# GitHub Pages 上传说明

本文件夹是《新能源氮化硅陶瓷基板制备生产线设计》的动态资料网站包，可直接上传到 GitHub Pages。

## 文件结构

- `index.html`：网站首页
- `styles.css`：页面样式
- `.nojekyll`：让 GitHub Pages 按普通静态资源发布
- `assets/figure-4-1-dynamic.gif`：图4-1 精密流延机动态展示
- `assets/figure-5-2-dynamic.gif`：图5-2 气压烧结炉动态展示
- `videos/`：后续可放视频
- `docs/`：后续可放论文 PDF、补充材料或 CAD 图

## 推荐发布步骤

1. 登录 GitHub，新建公开仓库，推荐仓库名：`si3n4-dynamic-figures`。
2. 把本文件夹中的全部文件上传到仓库根目录。
3. 进入仓库 `Settings` -> `Pages`。
4. `Source` 选择 `Deploy from a branch`。
5. `Branch` 选择 `main`，目录选择 `/ (root)`，然后保存。
6. 等待 GitHub Pages 发布完成，获得类似下面的访问地址：

   `https://你的GitHub用户名.github.io/si3n4-dynamic-figures/`

7. 用手机打开该地址，确认两个动态图均可播放。
8. 用该地址生成二维码，插入论文相应图题附近。建议说明文字：`扫码观看动态图及说明`。

## 注意事项

- 仓库建议设为公开，否则老师或答辩现场扫码可能需要登录。
- 两个 GIF 文件较大，首次打开可能需要等待几秒。
- 如需加入视频，建议把 MP4 或 WebM 文件放入 `videos/`，再在 `index.html` 中增加视频展示区。

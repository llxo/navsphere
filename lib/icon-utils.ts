/**
 * Icon路径处理工具函数
 */

/**
 * 将本地icon路径转换为GitHub在线路径
 * @param iconPath 原始icon路径 (如: /assets/favicon_1756800131919.png)
 * @returns GitHub在线路径
 */
export function convertIconPathToOnline(iconPath: string): string {
  if (!iconPath) return iconPath;
  
  // 如果已经是完整的URL，直接返回
  if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
    return iconPath;
  }
  
  // 如果是本地路径，转换为GitHub raw content URL
  if (iconPath.startsWith('/assets/')) {
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;
    const githubBranch = process.env.GITHUB_BRANCH || 'main';
    
    if (!githubOwner || !githubRepo) {
      console.warn('GitHub config not found, returning original path:', iconPath);
      return iconPath;
    }
    
    // 转换路径：/assets/xxx.png -> https://raw.githubusercontent.com/owner/repo/branch/public/assets/xxx.png
    const onlinePath = `https://raw.githubusercontent.com/${githubOwner}/${githubRepo}/${githubBranch}/public${iconPath}`;
    return onlinePath;
  }
  
  // 对于其他路径，保持原样
  return iconPath;
}

/**
 * 批量转换navigation数据中的icon路径
 * @param navigationData 导航数据
 * @returns 转换后的导航数据
 */
export function convertNavigationIconsToOnline(navigationData: any): any {
  if (!navigationData || !navigationData.navigationItems) {
    return navigationData;
  }
  
  const convertItem = (item: any): any => {
    const convertedItem = { ...item };
    
    // 转换当前item的icon
    if (convertedItem.icon) {
      convertedItem.icon = convertIconPathToOnline(convertedItem.icon);
    }
    
    // 递归转换子项目
    if (convertedItem.items && Array.isArray(convertedItem.items)) {
      convertedItem.items = convertedItem.items.map(convertItem);
    }
    
    // 递归转换子分类
    if (convertedItem.subCategories && Array.isArray(convertedItem.subCategories)) {
      convertedItem.subCategories = convertedItem.subCategories.map((subCategory: any) => {
        const convertedSubCategory = { ...subCategory };
        
        // 转换子分类的icon
        if (convertedSubCategory.icon) {
          convertedSubCategory.icon = convertIconPathToOnline(convertedSubCategory.icon);
        }
        
        // 转换子分类中的items
        if (convertedSubCategory.items && Array.isArray(convertedSubCategory.items)) {
          convertedSubCategory.items = convertedSubCategory.items.map(convertItem);
        }
        
        return convertedSubCategory;
      });
    }
    
    return convertedItem;
  };
  
  return {
    ...navigationData,
    navigationItems: navigationData.navigationItems.map(convertItem)
  };
}

/**
 * 检查是否为本地assets路径
 * @param path 路径
 * @returns 是否为本地assets路径
 */
export function isLocalAssetsPath(path: string): boolean {
  return Boolean(path && path.startsWith('/assets/'));
}

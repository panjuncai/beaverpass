export default function isEduEmail(email: string) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    
    // 邮箱转小写
    email = email.toLowerCase();
    
    // 提取域名部分
    const domain = email.split('@')[1];
    if (!domain) {
        return false;
    }
    
    // 检查常见教育邮箱格式
    return (
        // .edu 结尾（美国高等教育机构）
        domain.endsWith('.edu') || 
        // .edu.xx 格式（如 .edu.cn, .edu.hk 等）
        domain.includes('.edu.') || 
        // .ac.xx 格式（如 .ac.uk, .ac.jp 等学术机构）
        domain.includes('.ac.') ||
        // 常见大学域名关键词
        domain.includes('.university.') ||
        domain.includes('.college.') ||
        domain.includes('.school.') ||
        domain.includes('.institute.') ||
        domain.includes('-edu.') ||
        // 中国高校特殊域名
        domain.endsWith('.edu.cn')
    );
}
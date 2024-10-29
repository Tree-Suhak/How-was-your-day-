document.addEventListener('DOMContentLoaded', loadPosts);

async function loadPosts() {
    const response = await fetch('/get-posts');
    const posts = await response.json();
    
    const postList = document.getElementById('posts');
    postList.innerHTML = '';  // 기존 게시글 초기화
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('p-4', 'bg-white', 'shadow', 'rounded');
        postElement.innerHTML = `
            <h2 class="text-xl font-bold">${post.title}</h2>
            <p class="mt-2">${post.content}</p>
            <small class="text-gray-500">작성일: ${new Date(post.createdAt).toLocaleDateString()}</small>
        `;
        postList.appendChild(postElement);
    });
}

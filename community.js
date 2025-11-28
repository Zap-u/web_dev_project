const postsList = document.getElementById("postsList");
const postBtn = document.getElementById("postBtn");
const postText = document.getElementById("postText");
const userNameContainer = document.getElementById("userNameContainer");
const currentUserNameSpan = document.getElementById("currentUserName");
const changeNameBtn = document.getElementById("changeNameBtn");

// Elements for the dynamic stats update
const statDiscussions = document.querySelector(".discussions-color").nextElementSibling;
const statLikes = document.querySelector(".likes-color").nextElementSibling;
const statMembers = document.querySelector(".members-color").nextElementSibling;

const STORAGE_KEY = "hobbyBCPosts";
const USER_NAME_KEY = "hobbyBCUserName";

function fullPresentationReset() {
  if (confirm("This will fully wipe all saved data for this website. Continue?")) {
    // Clears ALL localStorage data for THIS domain only
    localStorage.clear();

    // Hard reload to guarantee nothing cached is reused
    location.reload(true);
  }
}

window.fullPresentationReset = fullPresentationReset;

// -------------------------------------------------------------

// --- Utility Functions ---

function createInitials(name) {
  const parts = name.trim().split(" ");
  return parts[0][0] + (parts[1] ? parts[1][0] : "");
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// --- Persistence Functions ---

function loadPosts() {
  const postsJSON = localStorage.getItem(STORAGE_KEY);
  return postsJSON ? JSON.parse(postsJSON) : [];
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  updateCommunityStats(); 
}

// --- Dynamic Stats Calculation ---

function updateCommunityStats() {
    const posts = loadPosts();
    let totalDiscussions = posts.length;
    let totalLikes = 0;
    let uniqueAuthors = new Set();

    function processComments(comments) {
        comments.forEach(comment => {
            totalLikes += comment.likes;
            uniqueAuthors.add(comment.author);
            if (comment.replies) {
                processComments(comment.replies);
            }
        });
    }

    posts.forEach(post => {
        uniqueAuthors.add(post.author);
        totalLikes += post.likes;
        if (post.comments) {
            processComments(post.comments);
        }
    });

    if (statDiscussions) statDiscussions.textContent = totalDiscussions.toLocaleString();
    if (statLikes) statLikes.textContent = totalLikes.toLocaleString();
    if (statMembers) statMembers.textContent = uniqueAuthors.size.toLocaleString();
}

// --- Identity Management ---

function updateAuthorNameInPosts(oldName, newName) {
    let posts = loadPosts();
    let changesMade = false;

    function recursivelyUpdateComments(comments, oldN, newN) {
        comments.forEach(comment => {
            if (comment.author === oldN) {
                comment.author = newN;
                changesMade = true;
            }
            if (comment.replies) {
                recursivelyUpdateComments(comment.replies, oldN, newN);
            }
        });
    }

    posts.forEach(post => {
        // Update the main post author
        if (post.author === oldName) {
            post.author = newName;
            changesMade = true;
        }
        // Update comments and replies recursively
        recursivelyUpdateComments(post.comments, oldName, newName);
    });

    if (changesMade) {
        savePosts(posts); // Save the updated data
        // Rerender all posts to reflect the new names immediately
        postsList.innerHTML = '';
        posts.reverse().forEach(renderPost);
    }
}

// --- User Name Persistence (MODIFIED) ---

function getUserName() {
    return localStorage.getItem(USER_NAME_KEY);
}

function setUserName(name) {
    localStorage.setItem(USER_NAME_KEY, name);
    currentUserNameSpan.textContent = name;
}

async function promptForUserName(isInitialSetup = false) {
    let oldName = getUserName();
    let promptMessage;

    if (isInitialSetup && !oldName) {
        promptMessage = "Welcome! Please enter the name you want to use for posting:";
    } else if (!isInitialSetup && oldName) {
        promptMessage = `Your current name is "${oldName}". Enter a new name to change it:`;
    } else {
        return oldName;
    }

    const newName = prompt(promptMessage, oldName || "");

    if (newName !== null && newName.trim() !== "") {
        const finalName = newName.trim();
        
        if (oldName && oldName !== finalName) {
            // CRITICAL CALL: Update all posts/comments with the new name
            updateAuthorNameInPosts(oldName, finalName);
        }

        setUserName(finalName);
        return finalName;
    }
    
    if (isInitialSetup && !oldName) {
        alert("A name is required to post. Please try again.");
        return promptForUserName(true);
    }

    return oldName;
}

// --- Post & Comment Data Structure (Omitted for brevity) ---

function createPostData(text, author) {
    return {
        id: Date.now(),
        author: author,
        text: text,
        tag: "General",
        likes: 0,
        liked: false,
        timestamp: new Date().toISOString(),
        comments: []
    };
}

function createCommentData(text, author) {
    return {
        id: Date.now(),
        author: author,
        text: text,
        timestamp: new Date().toISOString(),
        likes: 0,
        liked: false,
        replies: []
    };
}

// --- Rendering Functions (Updated with "🗑 X" for consistency) ---

function renderPost(postData) {
  const initials = createInitials(postData.author);
  const currentUserName = getUserName();
  
  const post = document.createElement("div");
  post.className = "post-card";
  post.dataset.postId = postData.id;

  const canDeletePost = postData.author === currentUserName;
  
  const deletePostButtonHtml = canDeletePost ? 
    `<span class="delete-post-btn delete-btn">🗑 X</span>` : 
    '';

  post.innerHTML = `
    <div class="post-tag">${postData.tag}</div>

    <div class="post-header">
      <div class="avatar">${initials}</div>
      <div>
        <div class="post-author">${postData.author}</div>
        <div class="post-time">${formatTime(postData.timestamp)}</div>
      </div>
    </div>

    <div class="post-preview">${postData.text}</div>

    <div class="post-footer">
      <span class="likes ${postData.liked ? 'liked' : ''}">💜 ${postData.likes}</span>
      <span class="comment-btn">💬 ${postData.comments.length}</span>
      ${deletePostButtonHtml} 
    </div>

    <div class="comments-section" style="margin-top: 15px;"></div>
  `;

  postsList.prepend(post);

  const commentsSection = post.querySelector(".comments-section");
  postData.comments.forEach(commentData => {
    commentsSection.appendChild(renderComment(commentData, postData.id));
  });

  setupLikes(post, postData);
  setupComments(post, postData);
  
  if (canDeletePost) {
    setupDeletePost(post, postData.id);
  }

  return post;
}

function renderComment(commentData, postId, parentCommentId) {
  const initials = createInitials(commentData.author);
  const currentUserName = getUserName(); 
  
  const wrap = document.createElement("div");
  wrap.className = "comment-box";
  wrap.style.marginTop = "10px";
  wrap.dataset.commentId = commentData.id;

  const canDelete = commentData.author === currentUserName;
  const deleteButtonHtml = canDelete ? 
    `<span class="delete-btn">🗑 X</span>` : // Updated to '🗑 X'
    '';


  wrap.innerHTML = `
    <div style="display:flex; align-items:center;">
      <div class="avatar" style="width:34px;height:34px;font-size:.8rem;">${initials}</div>
      <div>
        <div class="post-author">${commentData.author}</div>
        <div class="post-time">${formatTime(commentData.timestamp)}</div>
      </div>
    </div>

    <div class="comment-text" style="margin:8px 0 5px; color:#444; margin-left: 46px;">${commentData.text}</div>

    <div class="comment-actions" style="display:flex; gap:15px; cursor:pointer; color:#7560a8; margin-left: 46px;">
      <span class="comment-likes ${commentData.liked ? 'liked' : ''}">💜 ${commentData.likes}</span>
      <span class="reply-btn">↪ Reply</span>
      ${deleteButtonHtml}
    </div>

    <div class="reply-section" style="margin-left:0; margin-top:10px;"></div>
  `;

  const replySection = wrap.querySelector(".reply-section");
  commentData.replies.forEach(replyData => {
    replySection.appendChild(renderComment(replyData, postId, commentData.id));
  });

  setupCommentLikes(wrap, postId, commentData.id);
  setupReply(wrap, postId, commentData.id);
  
  if (canDelete) {
    setupDeleteComment(wrap, postId, commentData.id);
  }

  return wrap;
}

// --- Event Handlers ---

function findComment(comments, targetCommentId) {
    for (const comment of comments) {
        if (comment.id === targetCommentId) {
            return comment;
        }
        const foundInReplies = findComment(comment.replies, targetCommentId);
        if (foundInReplies) {
            return foundInReplies;
        }
    }
    return null;
}

function deleteCommentRecursive(comments, targetCommentId) {
    for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === targetCommentId) {
            comments.splice(i, 1); 
            return true;
        }
        if (deleteCommentRecursive(comments[i].replies, targetCommentId)) {
            return true;
        }
    }
    return false;
}

function setupDeletePost(postElement, postId) {
    const deleteBtn = postElement.querySelector('.delete-post-btn');
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (!confirm("Are you sure you want to delete this entire discussion post and all its comments?")) {
                return;
            }

            let posts = loadPosts();
            const initialLength = posts.length;
            
            posts = posts.filter(p => p.id !== postId);

            if (posts.length < initialLength) {
                savePosts(posts); 
                postElement.remove();
            } else {
                console.error("Post not found in data structure.");
            }
        };
    }
}


function setupDeleteComment(commentElement, postId, commentId) {
    const deleteBtn = commentElement.querySelector(".delete-btn");

    if (deleteBtn) {
        deleteBtn.onclick = () => {
            if (!confirm("Are you sure you want to delete this comment?")) {
                return;
            }

            const posts = loadPosts();
            const postIndex = posts.findIndex(p => p.id === postId);

            if (postIndex !== -1) {
                const post = posts[postIndex];
                
                if (deleteCommentRecursive(post.comments, commentId)) {
                    savePosts(posts); 
                    commentElement.remove();
                    
                    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
                    if (postElement) {
                         postElement.querySelector(".comment-btn").textContent = `💬 ${post.comments.length}`;
                    }
                } else {
                    console.error("Comment not found in data structure.");
                }
            }
        };
    }
}


postBtn.onclick = () => {
  const text = postText.value.trim();
  const authorName = getUserName();
  if (!authorName) {
     promptForUserName(true);
     return;
  }
  if (!text) return;

  const newPostData = createPostData(text, authorName);
  const posts = loadPosts();
  posts.unshift(newPostData);
  savePosts(posts); 
  renderPost(newPostData);
  postText.value = "";
};

function setupLikes(postElement, postData) {
  const likeBtn = postElement.querySelector(".likes");
  likeBtn.onclick = () => {
    const posts = loadPosts();
    const index = posts.findIndex(p => p.id === postData.id);
    if (index !== -1) {
      const p = posts[index];
      if (p.liked) {
        p.likes--;
        likeBtn.classList.remove("liked");
      } else {
        p.likes++;
        likeBtn.classList.add("liked");
      }
      p.liked = !p.liked;
      likeBtn.textContent = `💜 ${p.likes}`;
      savePosts(posts); 
      postData.likes = p.likes;
      postData.liked = p.liked;
    }
  };
}

function setupCommentLikes(commentElement, postId, commentId) {
    const likeBtn = commentElement.querySelector(".comment-likes");
    likeBtn.onclick = () => {
        const posts = loadPosts();
        let post = posts.find(p => p.id === postId);
        if (post) {
            let commentToUpdate = findComment(post.comments, commentId);
            if (commentToUpdate) {
                if (commentToUpdate.liked) {
                    commentToUpdate.likes--;
                    likeBtn.classList.remove("liked");
                } else {
                    commentToUpdate.likes++;
                    likeBtn.classList.add("liked");
                }
                commentToUpdate.liked = !commentToUpdate.liked;
                likeBtn.textContent = `💜 ${commentToUpdate.likes}`;
                savePosts(posts); 
            }
        }
    };
}

function setupComments(postElement, postData) {
  const commentBtn = postElement.querySelector(".comment-btn");
  const commentsSection = postElement.querySelector(".comments-section");
  commentBtn.onclick = () => {
    const authorName = getUserName();
    if (!authorName) {
      promptForUserName(true);
      return;
    }
    if (commentsSection.querySelector(".comment-input-box")) return;

    const input = document.createElement("div");
    input.className = "comment-input-box";
    input.innerHTML = `<textarea class="comment-input" placeholder="Write a comment..."></textarea><button class="comment-submit">Post</button>`;
    commentsSection.prepend(input);

    const submit = input.querySelector(".comment-submit");
    const textarea = input.querySelector(".comment-input");
    submit.onclick = () => {
      const msg = textarea.value.trim();
      if (!msg) return;

      const newCommentData = createCommentData(msg, authorName);
      const posts = loadPosts();
      const postIndex = posts.findIndex(p => p.id === postData.id);

      if (postIndex !== -1) {
        posts[postIndex].comments.push(newCommentData);
        savePosts(posts); 
      }
      const commentElement = renderComment(newCommentData, postData.id);
      commentsSection.appendChild(commentElement);
      input.remove();
      postElement.querySelector(".comment-btn").textContent = `💬 ${posts[postIndex].comments.length}`;
    };
  };
}

function setupReply(commentElement, postId, parentCommentId) {
    const replyBtn = commentElement.querySelector(".reply-btn");
    const replySection = commentElement.querySelector(".reply-section");

    replyBtn.onclick = () => {
        const authorName = getUserName();
        if (!authorName) {
            promptForUserName(true);
            return;
        }
        if (replySection.querySelector(".reply-input-box")) return;

        const box = document.createElement("div");
        box.className = "reply-input-box";
        box.innerHTML = `<textarea class="comment-input" placeholder="Write a reply..."></textarea><button class="comment-submit">Reply</button>`;
        replySection.prepend(box);

        const submit = box.querySelector(".comment-submit");
        const textarea = box.querySelector(".comment-input");

        submit.onclick = () => {
            const msg = textarea.value.trim();
            if (!msg) return;

            const newReplyData = createCommentData(msg, authorName);
            let posts = loadPosts();
            let post = posts.find(p => p.id === postId);

            if (post) {
                function addReply(comments, targetCommentId, replyData) {
                    for (let i = 0; i < comments.length; i++) {
                        if (comments[i].id === targetCommentId) {
                            comments[i].replies.push(replyData);
                            return true;
                        }
                        if (addReply(comments[i].replies, targetCommentId, replyData)) {
                            return true;
                        }
                    }
                    return false;
                }
                addReply(post.comments, parentCommentId, newReplyData);
                savePosts(posts); 
            }
            const replyElement = renderComment(newReplyData, postId, parentCommentId);
            replySection.appendChild(replyElement);
            box.remove();
        };
    };
}


// --- Initialization ---

function initializeCommunity() {
    const initialName = getUserName();
    if (initialName) {
        currentUserNameSpan.textContent = initialName;
    } else {
        currentUserNameSpan.textContent = "Guest";
        promptForUserName(true);
    }

    changeNameBtn.onclick = () => promptForUserName(false);

    const posts = loadPosts();
    posts.reverse().forEach(renderPost);
    
    updateCommunityStats(); 
}

initializeCommunity();
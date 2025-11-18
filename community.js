const postsList = document.getElementById("postsList");
const postBtn = document.getElementById("postBtn");
const postText = document.getElementById("postText");

function createInitials(name) {
  const parts = name.trim().split(" ");
  return parts[0][0] + (parts[1] ? parts[1][0] : "");
}

postBtn.onclick = () => {
  const text = postText.value.trim();
  if (!text) return;

  const post = buildPost("You", text, "General");
  postsList.prepend(post);

  postText.value = "";
};

function buildPost(author, text, tag) {
  const initials = createInitials(author);

  const post = document.createElement("div");
  post.className = "post-card";

  post.innerHTML = `
    <div class="post-tag">${tag}</div>

    <div class="post-header">
      <div class="avatar">${initials}</div>
      <div>
        <div class="post-author">${author}</div>
        <div class="post-time">just now</div>
      </div>
    </div>

    <div class="post-preview">${text}</div>

    <div class="post-footer">
      <span class="likes">❤️ 0</span>
      <span class="comment-btn">💬 Comment</span>
    </div>

    <div class="comments-section" style="margin-top: 15px;"></div>
  `;

  setupLikes(post);
  setupComments(post);

  return post;
}

function setupLikes(post) {
  const likeBtn = post.querySelector(".likes");

  let liked = false;
  let likes = 0;

  likeBtn.onclick = () => {
    liked = !liked; // toggle like state

    if (liked) {
      likes++;
      likeBtn.classList.add("liked");
    } else {
      likes--;
      likeBtn.classList.remove("liked");
    }

    likeBtn.textContent = `❤️ ${likes}`;
  };
}

function setupComments(post) {
  const commentBtn = post.querySelector(".comment-btn");
  const commentsSection = post.querySelector(".comments-section");

  commentBtn.onclick = () => {
    const input = document.createElement("div");
    input.className = "comment-input-box";

    input.innerHTML = `
      <textarea class="comment-input" placeholder="Write a comment..."></textarea>
      <button class="comment-submit">Post</button>
    `;

    commentsSection.prepend(input);

    const submit = input.querySelector(".comment-submit");
    const textarea = input.querySelector(".comment-input");

    submit.onclick = () => {
      const msg = textarea.value.trim();
      if (!msg) return;

      const comment = buildComment("You", msg);
      commentsSection.appendChild(comment);

      input.remove();
    };
  };
}

function buildComment(author, text) {
  const initials = createInitials(author);

  const wrap = document.createElement("div");
  wrap.className = "comment-box";
  wrap.style.marginTop = "10px";

  wrap.innerHTML = `
    <div style="display:flex; align-items:center;">
      <div class="avatar" style="width:34px;height:34px;font-size:.8rem;">${initials}</div>
      <div>
        <div class="post-author">${author}</div>
        <div class="post-time">just now</div>
      </div>
    </div>

    <div class="comment-text" style="margin:8px 0 5px; color:#444;">${text}</div>

    <div class="comment-actions" style="display:flex; gap:15px; cursor:pointer; color:#7560a8;">
      <span class="reply-btn">↪ Reply</span>
    </div>

    <div class="reply-section" style="margin-left:40px; margin-top:10px;"></div>
  `;

  const replyBtn = wrap.querySelector(".reply-btn");
  const replySection = wrap.querySelector(".reply-section");

  replyBtn.onclick = () => {
    const box = document.createElement("div");
    box.className = "reply-input-box";

    box.innerHTML = `
      <textarea class="comment-input" placeholder="Write a reply..."></textarea>
      <button class="comment-submit">Reply</button>
    `;

    replySection.prepend(box);

    const submit = box.querySelector(".comment-submit");
    const textarea = box.querySelector(".comment-input");

    submit.onclick = () => {
      const msg = textarea.value.trim();
      if (!msg) return;

      const reply = buildComment("You", msg);
      replySection.appendChild(reply);

      box.remove();
    };
  };

  return wrap;
}

/*ULADZISLAU HOILA*/

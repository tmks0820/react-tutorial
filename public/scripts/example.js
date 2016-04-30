var CommentBox = React.createClass({
  getInitialState: function(){
    return {data: []};
  },
  loadCommentFromServer: function(){
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    })
  },
  handleCommentSubmit: function(comment){
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      cache: false,
      data: comment,
      success: function(data){
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err){
        this.setState({data: comments})
        console.log(this.props.url, status, err.toString());
      }.bind(this)
    })
  },
  componentDidMount: function(){
    this.loadCommentFromServer();
    setInterval(this.loadCommentFromServer, this.props.pollInterval);
  },
  render: function(){
    return(
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data}/>
        <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function(){
    var commentNodes = this.props.data.map(function(comment){
      return(
        <Comment author={comment.author}>
          {comment.text}
        </Comment>
      );
    });

    return(
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var Comment = React.createClass({
  rawMarkUp: function(){
    var rawMarkUp = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkUp };
  },
  render: function(){
    return(
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkUp()} />
      </div>
    );
  }
})

var CommentForm = React.createClass({
  handleSubmit: function(e){
    e.preventDefault();
    var author = ReactDOM.findDOMNode(this.refs.author).value.trim();
    var text = ReactDOM.findDOMNode(this.refs.text).value.trim();
    if(!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    ReactDOM.findDOMNode(this.refs.author).value = '';
    ReactDOM.findDOMNode(this.refs.text).value = '';
    return;
  },
  render: function(){
    return(
      <div className="commentForm">
        <form className="commentForm" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Your name" ref="author" />
          <input type="text" placeholder="Say something..." ref="text"/>
          <input type="submit" value="Post" />
        </form>
      </div>
    );
  }
});

ReactDOM.render(
  <CommentBox url="http://localhost:3000/api/comments" pollInterval={2000} />,
  document.getElementById('content')
);

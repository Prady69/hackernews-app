/* eslint-disable no-lone-blocks */
import React from 'react';
import _ from 'lodash';

class TableComponent extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            stories: [],
            loading: false,
            page: 0,
            total_page: 0
        }
    } 

    componentDidMount() {
        this.getDataFromApi();
    }

    getDataFromApi = async () => {
        this.setState({loading: true});
        const response = await fetch(`https://hn.algolia.com/api/v1/search_by_date?page=${this.state.page}`),
        stories = await response.json();
        this.setState({stories: stories.hits, total_page: stories.nbPages, loading: false});
        this.setState({page: this.state.page + 1});        
    }

    hideRowData = (objectID) => {
        let delete_story = _.remove(this.state.stories, (story) => story.objectID !== objectID )
        this.setState({stories: delete_story})
    }

    upvoteStory(objectID) {
        let upvotesList = localStorage.getItem('upvotes') || "";
        if(upvotesList.indexOf(objectID) > -1){
            return;
        }
        upvotesList = upvotesList.split(','); 
        upvotesList.push(objectID);
        localStorage.setItem('upvotes', upvotesList);
        this.updateStoriesWithUpvote();
    }

    updateStoriesWithUpvote(){
        let upvotesList = localStorage.getItem('upvotes') || "";
        upvotesList = upvotesList.split(','); 
        var storyChangedList = _.forEach(this.state.stories, element => {
            return _.find(upvotesList, ele => {
                if(element.objectID == ele){
                    element.upVote = true;
                }  
            })
        });
        this.setState({
            stories: storyChangedList
        })
    }

    render() {   
        let stories = this.state.stories,
        story_listing = [];
        {stories.map((story, index) => {
            story_listing.push(
                <tr key={story.objectID}>
                    <th width="50">{(this.state.page-1)*20 + index + 1}</th>
                    <th>{story.upVote && '1'} {story.upVote !== true && <i onClick={()=>this.upvoteStory(story.objectID)} className="fa fa-sort-asc" aria-hidden="true"></i>}</th>
                    <td>
                        <span className="story-title"> {story.story_title || story.title} </span>
                        <span className="story-url"> <a href={story.story_url || story.url}>( Domain )</a> </span>
                        <span className="story-auther"> by <b>{story.author}</b> </span>
                        <span className="story-date"> {(story.created_at_i)} </span>
                        <span className="story-unvote" > {story.upVote === true && '| unvote | '} </span>
                        <span className="story-hide" onClick={()=>this.hideRowData(story.objectID)}> [ Hide ] </span> 
                    </td>
                </tr>
            ) }
       )};

        return( <div className="container">
                <table className="table">
                    <thead>
                        <tr>
                           <th className="header" colSpan="4">
                                <img width="20" height="20" src={require('../images/icon.png')} alt="icon"/>
                                <span className="hacker"><a href="#"> Hacker News</a> </span>
                                <span className="new active"><a href="#"> new </a></span>
                            </th>
                        </tr>
                    </thead>


                    <tbody>{story_listing}</tbody>

                    {(this.state.page < this.state.total_page-1) && 
                        <tfoot> 
                            <tr>
                                <td colSpan={4}><p className="more" onClick={this.getDataFromApi}>More</p></td>
                            </tr>
                        </tfoot> 
                    }
                </table>
            </div>
        );
    
    }
}

export default TableComponent;
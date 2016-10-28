[
  {
    'repeat(5, 10)': {
      index: '{{index()}}',
      ID: '{{integer(1, 10000)}}',
      SuggestedBy: {
        first: '{{firstName()}}',
        last: '{{surname()}}'
      },
      Title: function (tags) {
  return 'Hello, ' + this.SuggestedBy.first + '! You have ' + tags.integer(5, 10) + ' unread messages.';
},
  TimeSavedPerWeek: '{{integer(3600000, 36000000)}}',
  NumberOfTicketsPerWeek: '{{integer(0, 100)}}'
  }
}
]
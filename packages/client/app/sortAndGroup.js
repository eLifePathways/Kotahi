export const sortAndGroupMessages = (messages, firstUnreadMessageId) => {
  if (messages.length === 0) return []
  const masterArray = []
  let newArray = []
  let checkId

  for (let i = 0; i < messages.length; i += 1) {
    const dateLabel = [
      {
        id: messages[i].created,
        user: {
          id: 'dateLabel',
        },
        created: messages[i].created,
        content: messages[i].created,
        type: 'dateLabel',
      },
    ]

    const dateWithUnreadLabel = [
      {
        id: messages[i].created,
        user: {
          id: 'dateWithUnreadLabel',
        },
        created: messages[i].created,
        content: messages[i].created,
        type: 'dateWithUnreadLabel',
      },
    ]

    const unreadLabel = [
      {
        id: messages[i].created,
        user: {
          id: 'unreadLabel',
        },
        created: messages[i].created,
        content: messages[i].created,
        type: 'unreadLabel',
      },
    ]

    let showUnread = firstUnreadMessageId === messages[i].id

    const showDate =
      new Date(messages[i].created).getDate() !==
      new Date(messages[Math.max(i - 1, 0)].created).getDate()

    let showDateWithUnread = showUnread && showDate

    if (showUnread) {
      checkId = null
    }

    if (i === 0) {
      showUnread = firstUnreadMessageId === messages[i].id
      showDateWithUnread = showUnread

      checkId = messages[i].user.id

      if (showDateWithUnread) {
        masterArray.push(dateWithUnreadLabel)
      } else {
        masterArray.push(dateLabel)
      }
    }

    const sameUser = messages[i].user.id === checkId

    const oldMessage = (current, previous) => {
      // => boolean
      /*
        Rethink db returns string timestamps. We need to convert them
        into a number format so that we can compare message timestamps
        more easily. .getTime() will convert something like:

        '2017-05-02T18:15:20.769Z'

        into:

        '1493748920.769'

        We then determine if the current message being evaluated is older
        than the previous evaulated message by a certain integer to determine
        if we should render a timestamp in the UI and create a new bubbleGroup
      */
      const c = new Date(current.created).getTime()
      const p = new Date(previous.created).getTime()
      return showDate || c > p + 3600000 * 6 // six hours;
    }

    // if we are evaulating a bubble from the same user
    if (sameUser) {
      // if we are still on the first message
      if (i === 0) {
        // push the message to the array
        newArray.push(messages[i])
      } else {
        // if we're on to the second message, we need to evaulate the timestamp
        // if the second message is older than the first message by our variance

        if (oldMessage(messages[i], messages[i - 1])) {
          // push the batch of messages to master array
          masterArray.push(newArray)

          if (showDate) {
            // insert a new dateLabel
            masterArray.push(dateLabel)
          }

          // reset the batch of new messages
          newArray = []
          // populate the new batch of messages with this next old message
          newArray.push(messages[i])
        } else {
          // if the message isn't older than our preferred variance,
          // we keep populating the same batch of messages
          newArray.push(messages[i])
        }
      }

      // and maintain the checkid
      checkId = messages[i].user.id
      // if the next message is from a new user
    } else {
      // we push the previous user's messages to the masterarray
      masterArray.push(newArray)

      if (showUnread && !showDateWithUnread) {
        masterArray.push(unreadLabel)
      }

      // if the new users message is older than our preferred variance
      if (i > 0 && oldMessage(messages[i], messages[i - 1])) {
        // push a dateLabel
        if (showDateWithUnread) {
          masterArray.push(dateWithUnreadLabel)
        } else if (showDate) {
          masterArray.push(dateLabel)
        }

        newArray = []
        newArray.push(messages[i])
      } else {
        // clear the messages array from the previous user
        newArray = []
        // and start a new batch of messages from the currently evaluating user
        newArray.push(messages[i])
      }

      // set a new checkid for the next user
      checkId = messages[i].user.id
    }
  }

  // when done, push the final batch of messages to masterArray
  // masterArray.push(newArray);
  // and return masterArray to the component
  masterArray.push(newArray)
  return masterArray
}

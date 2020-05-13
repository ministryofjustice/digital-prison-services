module.exports = ({ physicalMarks }) =>
  physicalMarks &&
  physicalMarks.map(physicalMark => ({
    label: physicalMark.type,
    details: [
      { label: 'Body part', value: physicalMark.bodyPart },
      { label: 'Side', value: physicalMark.side },
      { label: 'Orientation', value: physicalMark.orentiation },
      { label: 'Comment', value: physicalMark.comment },
    ],
    imageId: physicalMark.imageId,
  }))

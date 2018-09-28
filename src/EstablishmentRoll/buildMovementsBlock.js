export default (assignedBlockData, unassignedBlockData, movementsBlockData) => {
  const totalUnassigned = unassignedBlockData.data.totals.numbers.find(
    total => total.name === 'Total in cell'
  ).value;

  const currentRoll = assignedBlockData.data.totals.numbers.find(
    total => total.name === 'Total roll'
  ).value;

  return {
    name: 'Movements',
    numbers: [
      {
        name: 'Unlock roll',
        value: currentRoll - (movementsBlockData.data.in + movementsBlockData.data.out)
      },
      { name: 'In today', value: movementsBlockData.data.in },
      { name: 'Out today', value: movementsBlockData.data.out },
      { name: 'Current roll', value: currentRoll },
      { name: 'Unassigned', value: totalUnassigned + movementsBlockData.data.out }
    ]
  };
};

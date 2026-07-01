document.addEventListener('DOMContentLoaded', () => {
    
    const repairsModal = document.getElementById('repairsModal');

    document.addEventListener('click', (e) => {
        console.log(e.target.id)
        if(e.target.id === 'newRepairBtn'){
            repairsModal.classList.add('show')
        }
        else if(e.target.id === 'repairsCancelBtn') {
            console.log('sum')
            repairsModal.classList.remove('show');
        }
    });
});


axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('[name="_csrf"]').value;





const actions = async (action, id) => {
    var loveState,reportState,blockState;

    try {
        var res = await axios({
            method: 'post',
            url: '/user/actions',
            params: {
                action: action,
                userId: id
            }
        });
        if(res.data.buttonsState)
        {
            res.data.buttonsState.love == 1 ? loveState = 'Unlike' : loveState = 'like';
            res.data.buttonsState.report == 1 ? reportState = 'Reported' : reportState = 'report fake account';
            res.data.buttonsState.block == 1 ? blockState = 'UnBlock' : blockState = 'Block';

            $("#love").html(loveState);
            $("#report").html(reportState);
            $("#block").html(blockState);   
        }
    }
    catch (err)
    {
    }
}
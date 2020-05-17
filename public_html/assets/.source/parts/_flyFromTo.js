const flyFromTo = (from, to, time = 1000, beforeCSS = {}, afterCSS = {}) => {
    const $from = (from instanceof jQuery) ? from : $(from);
    const $to = (to instanceof jQuery) ? to : $(to);

    if (!$from.length || !$to.length) return $from;

    let $clone = $from.clone()
    .css({
        opacity: 1,
        position: 'fixed',
        top: $from.offset().top + ($from.height() / 2),
        left: $from.offset().left + ($from.width() / 2),
        width: $from.width(),
        transform: 'translate(-50%, -50%) scale(1)',
        transition: time + 'ms linear all',
        ...beforeCSS
    })
    .appendTo($from.parent())
    .css({
        'z-index': 9999,
        opacity: 0,
        top: $to.offset().top + ($to.height() / 2),
        left: $to.offset().left + ($to.width() / 2),
        transform: 'translate(-50%, -50%) scale(0.01)',
        ...afterCSS
    });

    setTimeout(() => $clone.remove(), time);
    return $from;
}

export default flyFromTo;
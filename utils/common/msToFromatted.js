module.exports = (timeMS) => {
    const pretty0 = (t) => {
        return t >= 10 ? t : `0${t}`;
    };

    const totalSeconds = Math.floor(timeMS / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${pretty0(minutes)}:${pretty0(seconds)}`;
};

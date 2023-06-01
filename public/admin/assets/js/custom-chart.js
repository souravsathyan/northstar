(function ($) {
    "use strict";

    /*Sale statistics Chart*/
    if ($('#myChart').length) {
        var ctx = document.getElementById('myChart').getContext('2d');
        let monthlyStr = $('#myChartData').data('monthly');
        let monthlyData = monthlyStr.split(',').map(Number);

        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Sales',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: '#fcf49a',
                    borderColor: '#ffeb12',
                    data: monthlyData
                },
                ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    }
                }
            },
        });
    } //End if

    if ($('#myChart3').length) {
        let ctx = document.getElementById('myChart3').getContext('2d');

        let dailyDataStr = $('#myChartData').data('daily')
        let dailyData = dailyDataStr.split(",").map(Number)

        let chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                datasets: [
                    {
                        label: 'Daily',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: '#ffb48c',
                        borderColor: '#f57733',
                        data: dailyData
                    },

                ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    }
                }
            }
        });
    }

})(jQuery);
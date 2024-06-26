function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const cities = [...new Set(data.flights.map(flight => flight.city))];
        const colors = cities.reduce((acc, city) => {
            acc[city] = getRandomColor();
            return acc;
        }, {});

        const datasets = cities.map(city => {
            return {
                label: city,
                data: data.flights.filter(flight => flight.city === city).map(flight => ({
                    x: flight.date,
                    y: flight.seats_sold,
                    comments: []
                })),
                fill: false,
                borderColor: colors[city],
                tension: 0.1
            };
        });

        const legend = document.getElementById('legend');
        cities.forEach(city => {
            const legendItem = document.createElement('div');
            legendItem.style.color = colors[city];
            legendItem.innerText = city;
            legend.appendChild(legendItem);
        });

        const ctx = document.getElementById('myChart').getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                plugins: {
                    annotation: {
                        annotations: {}
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const comments = context.raw.comments;
                                const commentText = comments.length > 0 ? `Комментарии: ${comments.join(', ')}` : '';
                                return `Дата: ${context.raw.x}, Проданные места: ${context.raw.y}. ${commentText}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month'
                        },
                        title: {
                            display: true,
                            text: 'Дата полета'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Проданные места'
                        }
                    }
                }
            }
        });

        document.getElementById('myChart').onclick = (event) => {
            const points = myChart.getElementsAtEventForMode(event, 'nearest', {intersect: true}, false);
            if (points.length) {
                const firstPoint = points[0];
                const dataset = myChart.data.datasets[firstPoint.datasetIndex];
                const dataPoint = dataset.data[firstPoint.index];

                const comment = prompt('Введите ваш комментарий:');
                if (comment) {
                    dataPoint.comments.push(comment);
                    const annotationId = `annotation-${Date.now()}`;
                    myChart.options.plugins.annotation.annotations[annotationId] = {
                        type: 'point',
                        xValue: dataPoint.x,
                        yValue: dataPoint.y,
                        backgroundColor: 'red',
                        borderColor: 'black',
                        borderWidth: 1,
                        label: {
                            content: comment,
                            enabled: true,
                            position: 'top'
                        }
                    };
                    myChart.update();
                }
            }
        };
    })
    .catch(error => {
        console.error('Error loading data:', error);
    });
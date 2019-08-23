const request = require('request');
const cheerio = require('cheerio');

const url = "https://www.kisa.or.kr/notice/bid_List.jsp";

request(url, (error, response, body) => {
    if (error) throw error;
    let $ = cheerio.load(body);
    try {
        let a1 = '';
        let a2 = '';
        let a3 = '';

        $('table').find('tr').each(function (index, elem) {
            if (index % 10 === 0) {
                a1 = $(this).find('th').text().trim();
                console.log(`${a1}`);
            } 
            else {
                a2 = $(this).find('td').text().trim();
                a3 = $(this).find('td').text().trim();
                console.log(a3)
            }
        });
    } catch (error) {
        console.error(error);
    }
});
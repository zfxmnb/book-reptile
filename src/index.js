const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const bookList = [
  {
    name: '剑来',
    entry: `https://www-xmkanshu-com.mipcdn.com/c/s/www.xmkanshu.com/book/mip/menu?bkid=672340121&fr=bdgfh&mip=1`
  }
];

const pageNum = 4;
const lastLength = 15;

const forEach = async (data, cb, i = 0) => {
  const list = [...data];
  const [item] = list.splice(0, 1);
  const next = i + 1;
  if (item) {
    await cb?.(item, i);
  }
  if (list.length) {
    return forEach(list, cb, next);
  }
  return list;
};

// 爬取章节
const sectionRender = async (section, book, page, index, pageId) => {
  if (!section.href) {
    return;
  }
  // 爬取章节
  const { searchParams } = new URL(section.href);
  const bkid = searchParams.get('bkid');
  const crid = searchParams.get('crid');
  let pg = searchParams.get('pg') || '1';

  const getPageContent = async (href) => {
    // console.info(`bkid=${bkid}; crid=${crid}; pg: ${pg} --------------------------`);
    await page.goto(href);
    const plist = await page.$$('#mip-reader-warp > .reader > p');
    await forEach(plist, async (p) => {
      const textJson = await p.getProperty('textContent');
      const text = await textJson.jsonValue();
      section.content += `${text}\r\n`;
    });

    const [next] = await page.$$('.navigator a.next');
    if (next) {
      const hrefJson = await next.getProperty('href');
      const nextHref = await hrefJson.jsonValue();
      const { searchParams: params } = new URL(nextHref);
      if (bkid === params.get('bkid') && crid === params.get('crid')) {
        pg = Number(pg) + 1;
        await getPageContent(`${nextHref}&pg=${pg}`);
      }
    }
  };

  const directory = path.join(process.cwd(), `./files/${book.name}`);
  const filePath = path.join(directory, `第${crid}章`);
  const isExists = fs.existsSync(filePath);

  if (section.href && !isExists) {
    await getPageContent(section.href);
    fs.writeFileSync(filePath, section.content);
    console.info(
      `页面进程${pageId} ========= 第${crid}章 ${section.content.length}字符`
    );
  }
};

const bookRender = async (pages, book) => {
  await pages[0].goto(book.entry);
  const directory = path.join(process.cwd(), `./files/${book.name}`);
  const exists = fs.existsSync(directory);
  if (!exists) {
    fs.mkdirSync(directory);
  }

  const alist = await pages[0].$$('.catalog-li > li > a');
  if (lastLength) {
    alist.splice(0, alist.length - lastLength);
  }
  const list = [];
  await forEach(alist, async (a) => {
    const hrefJson = await a.getProperty('href');
    const href = await hrefJson.jsonValue();
    const textJson = await a.getProperty('textContent');
    const text = await textJson.jsonValue();
    const title = text.trim();
    list.push({ title, href, content: `${title}\r\n\r\n` });
  });

  const pagesReadyStatus = pages.map(() => true);

  let index = list.length - 1;

  const render = (resolve) => {
    if (pagesReadyStatus.indexOf(false) === -1 && index === -1) {
      return resolve();
    }
    const i = pagesReadyStatus.indexOf(true);
    if (i > -1 && list[index]) {
      pagesReadyStatus[i] = false;
      sectionRender(list[index], book, pages[i], index, i).then(() => {
        pagesReadyStatus[i] = true;
        return render(resolve);
      });
      index -= 1;
      render(resolve);
    }
  };
  // 爬取章节
  if (list[index]) {
    await new Promise((resolve) => {
      render(resolve);
    });
  }
};

// 使用 puppeteer.launch 启动 Chrome
(async () => {
  const browser = await puppeteer.launch({
    headless: true, // 有浏览器界面启动
    slowMo: 0, // 放慢浏览器执行速度，方便测试观察
    args: [
      // 启动 Chrome 的参数，详见上文中的介绍
      '–no-sandbox',
      '--window-size=1280,960'
    ]
  });

  const pages = [];
  for (let i = 0; i < pageNum; i++) {
    pages.push(1);
  }
  // 生产page
  await forEach(pages, async (_, index) => {
    const page = await browser.newPage();
    pages[index] = page;
  });

  console.warn('pages launch!!!');

  // 爬取书籍
  await forEach(bookList, async (book) => {
    await bookRender(pages, book);
  });

  await forEach(pages, async (page) => {
    await page.close();
  });
  await browser.close();
})();

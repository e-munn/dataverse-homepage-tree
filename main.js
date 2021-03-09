const dataverse = './data/data_all.json';

const hdim = 800
const wdim = $(window).width();

if (wdim < 500){
  var mobile = true
  var width = 500
  var height = 750
  var svgWidth = '90vw'
  var svgHeight = '680px'
  var fontSize1 = 13
  var truncateLength = 25

} else {
  var mobile = false
  var width = 1600
  var height = 550
  var svgWidth = '100vw'
  var svgHeight = '40vw'
  var fontSize1 = 16
  var truncateLength = 50

}



const padding = 80

const linkFill = '#E0E0E0'
const linkHigh = '#DA9D81'

const nodeFill = '#999999'
const nodeHigh = '#000'


const sortOptions = [
  {option:'by time', root:'time'},
  {option:'by size', root:'size'}
]

const subjectList = [
  { "name": "Social Sciences", "category": "Social", "order": 0, "color":"#EF7F59", "src":"./icons/social.svg", "url":'harvard?q=&fq0=subject_ss%3A"Social%20Sciences"&types=dataverses%3Adatasets&sort=dateSort&order=desc' },
  { "name": "Medicine, Health and Life Sciences", "category": "Health", "order": 0, "color":"#ad0400", "src":"./icons/health.svg", "url":'harvard?q=&fq0=subject_ss%3A"Medicine,%20Health%20and%20Life%20Sciences"&types=dataverses%3Adatasets&sort=dateSort&order=desc' },
  { "name": "Law", "color":"#005254", "category": "Paperwork", "order": 0, "src":"./icons/law.svg", "url":'harvard?q=&fq0=subject_ss%3A"Law"&types=dataverses%3Adatasets&sort=dateSort&order=desc'  },
  { "name": "Computer and Information Science", "category": "Math", "order": 1, "color":"#006d12", "src":"./icons/computer.svg", "url":'harvard?q=&fq0=subject_ss%3A"Computer%20and%20Information%20Science"&types=dataverses%3Adatasets&sort=dateSort&order=desc'  },
  { "name": "Astronomy and Astrophysics", "category": "Science", "order": 3, "color":"#6CA1FF", "src":"./icons/astronomy.svg", "url":'harvard?q=&fq0=subject_ss%3A"Astronomy%20and%20Astrophysics"&types=dataverses%3Adatasets&sort=dateSort&order=desc'  },
  { "name": "Arts and Humanities", "category": "Art", "order": 0, "color":"#ab0080", "src":"./icons/arts.svg", "url":'harvard?q=&fq0=subject_ss%3A"Arts%20and%20Humanities"&types=dataverses%3Adatasets&sort=dateSort&order=desc'  },
  { "name": "Physics", "category": "Science", "order": 1, "color":"#002A9E", "src":"./icons/physics.svg", "url":'harvard?q=&fq0=subject_ss%3A"Physics"&types=dataverses%3Adatasets&sort=dateSort&order=desc'  },
  { "name": "Engineering", "category": "Math", "order": 0, "color":"#002d07", "src":"./icons/engineering.svg", "url":'harvard?q=&fq0=subject_ss%3A"Engineering"&types=dataverses%3Adatasets&sort=dateSort&order=desc'  },
  { "name": "Business and Management", "category": "Paperwork", "order": 1, "color":"#008EA5", "src":"./icons/business.svg", "url":'harvard?q=&fq0=subject_ss%3A"Business%20and%20Management"&types=dataverses%3Adatasets&sort=dateSort&order=desc'  },
  { "name": "Chemistry", "category": "Science", "order": 2, "color":"#0063F2","src":"./icons/chemistry.svg", "url":'harvard?q=&fq0=subject_ss%3A"Chemistry"&types=dataverses%3Adatasets&sort=dateSort&order=desc'  },
  { "name": "Mathematical Sciences", "category": "Math", "order": 2, "color":"#00c605", "src":"./icons/math.svg", "url":'harvard?q=&fq0=subject_ss%3A"Mathematical%20Sciences"&types=dataverses%3Adatasets&sort=dateSort&order=desc'  },
  { "name": "Agricultural Sciences", "category": "Science", "order": 4, "color":"#C5DAFF","src":"./icons/agriculture.svg", "url":'harvard?q=&fq0=subject_ss%3A"Agricultural%20Sciences"&types=dataverses%3Adatasets&sort=dateSort&order=desc'  },
  { "name": "Earth and Environmental Sciences", "category": "Science", "order": 0, "color":"#000D4C", "src":"./icons/earth.svg", "url":'harvard?q=&fq0=subject_ss%3A"Earth%20and%20Environmental%20Sciences"&types=dataverses%3Adatasets&sort=dateSort&order=desc'  },
  { "name": "Multidisciplinary", "category": "Multi", "order": 0, "color":"#333", "src":"./icons/multi.svg", "url":''  },
  // { "name": "Other", "category": "", "order": 1, "color":"#FFC395", "src":"./icons/multi.svg", "url":''  }
];



//////////////////////////////////////////////////////////////////////////

d3.json(dataverse).then((data) => {


  //----------DATA CLEANING + STRUCTURING-----------//
  //------------------------------------------------//

  var root = d3.hierarchy(data)
  // SORT SUBJECTS BY THEIR POPULARITY
  const sortSubjects = (array, order) => {
      array.sort((a, b) => {
        const A = a;
        const B = b;
        return order.indexOf(A) > order.indexOf(B) ? 1 : -1;
      });
    return array;
  };

  // ADD SORTED AND TRIMMED AND FILTERED SUBJECTS TO THE DATA
  const subjectNames = subjectList.map(d => d.name)
  var cleanSubjects;
  root.each( d => {
    cleanSubjects = String(d.data.subjects).split(";").map(a => a.trim()).filter(a => !(a == "")).filter(a => !(a == "N/A")).filter(a => !(a == "Other")).filter(a => !(a == "undefined"))
    cleanSubjects = sortSubjects(cleanSubjects, subjectNames)
    d.data.subjects = cleanSubjects
  })
  root.sum(d => 1)

  root.children = root.children.filter(d => d.children != null).filter(d => d.children.length > 4)


  root.each(d => {
    if(d.children){
      if(d.children.length > 4000){
        for(var i = 0; i < 3500; i++)
          d.children.pop()
      }
    }
  })

  const parse = d3.timeParse('%Y-%m-%d');
  root = root.sort((a, b) => parse(a.data.date) - parse(b.data.date))


  //-------------------SVG SETUP--------------------//
  //------------------------------------------------//


  const main = d3.select('.viz')

  const svg = main
    .append('svg')
    .attr('width', svgWidth)
    .style('height', svgHeight)
    .attr("preserveAspectRatio", "xMidYMin meet")
    .attr("viewBox", `0 0 ${ width } ${ height }`)


  var buttonBox = svg
    .append('g')
    .attr('class', 'buttons')
    .attr('alignment-baseline', 'middle')
    .style('cursor', 'pointer')
    .style('cursor', 'pointer')
    .attr('text-anchor', 'end')
    .style('user-select', 'none')
    .style('text-transform', 'uppercase')
    .attr('font-size', `${fontSize1 + 2}`+'pt')

  var eachButton = buttonBox
    .selectAll('g')
    .data(sortOptions)
    .join('g')
    .attr('fill', (d, i) => i == 0 ? '#000' : '#999999')

  eachButton
    .append('text')
    .text(d => d.option)
    .attr('x', width - 63)
    .attr('y', (d, i) => height + 10 + 40*(i))






  const draw = (root, subjectList, sortType) => {

    // var tree = d3.tree().size([width - padding, height - padding])(root)

    var tree = d3.tree().size([width - padding, height - padding])(root)


    tree.y = tree.y + 35

    const g = svg
      .append('g')
      .attr('id', 'main-viz')
      .attr('transform', `translate(${padding/2},${0})` );

    //-------------------CREATE AXES--------------------//
    //------------------------------------------------//

    const axis = g
      .append('g')
    axis.append('path')
      .attr('d', d3.line()([[20, height - 37], [width - padding - 20, height - 37]]))
      .attr('stroke-width', .5)
      .attr('stroke', '#999999')
    var axisLabels = axis.append('g')
      .attr('font-size', `${fontSize1}`+'pt')
      .attr('font-weight', '500')
      .attr('fill', '#999999')
    var axisStart = axisLabels.append('text')
      .attr('text-anchor', 'start')
      .attr('x', 20)
      .attr('y', height - 50)
    var axisEnd = axisLabels.append('text')
      .attr('text-anchor', 'end')
      .attr('x', width - padding - 20)
      .attr('y', height - 50)

    sortType == 'time' ? axisStart.text('2014') : axisStart.text('small collections')
    sortType == 'time' ? axisEnd.text('NOW') : axisEnd.text('large collections')

  //--------------------------SCALES + TRANSITIONS + MORE-------------------//
  //------------------------------------------------------------------------//

    const subjectColorScale = d3.scaleOrdinal()
      .domain(subjectNames)
      .range(subjectList.map(d => d.color))

    const subjectIconScale = d3.scaleOrdinal()
      .domain(subjectNames)
      .range(subjectList.map(d => d.src))

    const subjectUrl = d3.scaleOrdinal()
      .domain(subjectNames)
      .range(subjectList.map(d => d.url))

    const transition_1 = d3.transition()
      .duration(150)
      .ease(d3.easeQuadIn)

    const truncate = (a) => {
      return a.length > truncateLength ? a.slice(0,truncateLength-1) + '...' : a
    }

  //--------------------------DRAWING TREE PATHS----------------------------//
  //------------------------------------------------------------------------//

    //bezier point, adjusts curve
    //margin between nodes and path

    const drawLink = (a) => {
      var handle = 55
      var nodeTall = 5

      var lHeight = root.children[0].y - root.y
      lHeight = lHeight + 20
      var smidge = .1;
      var path = d3.path()
      path.moveTo(a.x, a.y + nodeTall);
      path.bezierCurveTo(a.x, a.y + (lHeight/2), a.children[0].x, a.children[0].y - handle, a.children[0].x - smidge, a.children[0].y - 5);
      path.lineTo(a.children[a.children.length - 1].x + smidge, a.children[a.children.length - 1].y - 5);
      path.bezierCurveTo(a.children[a.children.length - 1].x, a.children[a.children.length - 1].y - handle, a.x, a.y + (lHeight/2), a.x, a.y + nodeTall);
      return path

    }
  //////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////

  const over = (event, d) => {
    //informs whether to draw tooltip to the left or right
    const toolFlip = (a) => {return (a.x > root.x ? -1 : 1)}

    const toolFlipMain = toolFlip(d)

    var current = d3.select(event.currentTarget)
      .raise()

    var toolTipWrap = current.append('g')

    var ancestorsWrap = toolTipWrap
      .append('g')
      .style('pointer-events', 'none')

    var ancestorsArray = d.ancestors()
    var ancestorPaths = ancestorsWrap.selectAll('path')
      .data(ancestorsArray)
      .join('path')
      .attr('d', d => drawLink(d))
      .attr('stroke', a => (a.data.subjects.length > 1 || a.data.name == 'root') ? '#4C4C4C' : subjectColorScale(d.data.subjects[0]) )
      .attr('fill', 'transparent')
      .attr('stroke-width', 1.5)
      .attr('stroke-width', (d, i) => i == 0 ? 3 : 2.5)
      .attr('opacity', 0)

    ancestorPaths
      .transition()
      .duration(200)
      .delay((d, i) => {return i*100})
      .attr('opacity', 1)

    var iconDiameter = 24
    var ancestorsIcons = ancestorsWrap.selectAll('image')
      .data(ancestorsArray)
      .join('image')
      .attr('pointer-events', 'none')
      .attr('width', 0)
      .attr('x', a => a.x)
      .attr('y', a => a.y)
      .attr('href', a => a.data.subjects.length == 1 ? subjectIconScale(a.data.subjects[0]) : './icons/multi.svg')
    ancestorsIcons
      .transition()
      .duration(300)
      .attr('width', (a,i) => i == 0 ? iconDiameter : iconDiameter - 10)
      .attr('x', (a,i) => a.x - (i == 0 ? iconDiameter/2 : (iconDiameter - 10)/2 ))
      .attr('y', (a,i) => a.y - (i == 0 ? iconDiameter/2 : (iconDiameter - 10)/2 ))

    ancestorsArray.shift()

    var ancestorsText = ancestorsWrap.selectAll('text')
      .data(ancestorsArray)
      .join('text')
      .attr('opacity', 0)
      .attr('x', a => toolFlip(a) == 1 ? a.x + 10 : a.x - 10)
      .attr('y', a => a.y)
      .attr('text-anchor', a => toolFlip(a) == 1 ? 'start' : 'end')
      .attr('font-size', `${fontSize1}`+'pt')
      .style('alignment-baseline', 'middle')
      .style('text-shadow', '3px 3px 3px #FFF, -3px 3px 3px #FFF,  3px -3px 3px #FFF, -3px -3px 3px #FFF ')
      .text(a => !(a.data.name == 'root') ? truncate(a.data.name.replace(' Dataverse', '')) : 'Harvard Dataverse Repository' )
    ancestorsText
      .transition()
      .duration(200)
      .delay((d, i) => {return i*100})
      .attr('opacity', .9)

      var desc = d.descendants()
      var toolHeaders = [
        d.data.name,
        // 'Contains : ' + d.children.length,
        // 'Contains : ' + desc.length,
        'Updated: ' + d.data.date
      ]

      var labelWrap = toolTipWrap.append('g')

      var labelText = labelWrap.selectAll('text')
        .data( toolHeaders.concat(d.data.subjects) )
        .join('text')
        .attr('opacity', 0)
        .style('font-size', (a,i) => i == 0 ? `${fontSize1}`+'pt' : i < 2 ? `${fontSize1-2}`+'pt' : `${fontSize1-4}`+'pt')
        .style('position', 'absolute')
        .attr('pointer-events', 'none')
        .style('alignment-baseline', 'middle')
        .style('text-shadow', '3px 3px 3px #FFF, -3px 3px 3px #FFF,  3px -3px 3px #FFF, -3px -3px 3px #FFF ')
        .attr('text-anchor', toolFlipMain == 1 ? 'start' : 'end')
        .attr('x', (a,i) => i == 0 ? d.x + 24 * toolFlipMain : d.x + 32 * toolFlipMain)
        .attr('y', d.y)
        .text(a => (a == 'root') ? 'Harvard Dataverse Repository' : truncate(a.replace(' Dataverse', '')))
      labelText
        .transition()
        .duration(300)
        .ease(d3.easeQuadIn)
        .delay((d,i) => {return i*50})
        .attr('y', (a,i) => (d.y) + ((i < 2) ? (i) * 23 : 16 + (i) * 17))
        .attr('opacity', 1)
  }


  const out = (event, d, t2) => {

    var current = d3.select(event.currentTarget)
    current.select('g').remove()

  }

    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////


  const stay = (event, d) => {
    var iconDiameter = 24
    //informs whether to draw tooltip to the left or right
    const toolFlip = (a) => {return (a.x > root.x ? -1 : 1)}
    const toolFlipMain = toolFlip(d)

    var current = d3.select(event.currentTarget)
    var parent = d3.select(event.currentTarget.parentElement)
    const overLay = parent
      .append('g')
      .attr('id', 'tool')
      .style('pointer-events', 'none')
    overLay
      .append('g')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width-padding)
      .attr('height', height-80)
      .attr('fill', 'white')
      .attr('opacity', .6)
      .style('pointer-events', 'all')
      .on('click', () => overLay.remove())

      var toolTipWrap = overLay.append('g')
      var ancestorsWrap = toolTipWrap
        .append('g')
        .style('pointer-events', 'none')

      var ancestorsArray = d.ancestors()
      var ancestorPaths = ancestorsWrap.selectAll('path')
        .data(ancestorsArray)
        .join('path')
        .attr('d', d => drawLink(d))
        .attr('stroke', a => (a.data.subjects.length > 1 || a.data.name == 'root') ? '#4C4C4C' : subjectColorScale(d.data.subjects[0]) )
        .attr('fill', 'transparent')
        .attr('stroke-width', 1.5)
        .attr('stroke-width', (d, i) => i == 0 ? 3 : 2.5)
        .attr('opacity', 1)

      var ancestorsIcons = ancestorsWrap.selectAll('image')
        .data(ancestorsArray)
        .join('image')
        .attr('pointer-events', 'none')
        .attr('href', a => a.data.subjects.length == 1 ? subjectIconScale(a.data.subjects[0]) : './icons/multi.svg')
        .attr('width', (a,i) => i == 0 ? iconDiameter : iconDiameter - 10)
        .attr('x', (a,i) => a.x - (i == 0 ? iconDiameter/2 : (iconDiameter - 10)/2 ))
        .attr('y', (a,i) => a.y - (i == 0 ? iconDiameter/2 : (iconDiameter - 10)/2 ))

      var ancestorsText = ancestorsWrap.selectAll('text')
        .data(ancestorsArray.slice(1))
        .join('text')
        .attr('opacity', 0)
        .attr('x', a => toolFlip(a) == 1 ? a.x + 10 : a.x - 10)
        .attr('y', a => a.y)
        .attr('text-anchor', a => toolFlip(a) == 1 ? 'start' : 'end')
        .attr('font-size', `${fontSize1}`+'pt')
        .style('alignment-baseline', 'middle')
        .style('text-shadow', '3px 3px 3px #FFF, -3px 3px 3px #FFF,  3px -3px 3px #FFF, -3px -3px 3px #FFF ')
        .text(a => !(a.data.name == 'root') ? truncate(a.data.name.replace(' Dataverse', '')) : 'Harvard Dataverse Repository Repository' )
        .attr('opacity', .4)

        const send = (a) => {
          var url = 'https://dataverse.harvard.edu/dataverse/'
          url = url.concat(a)
          window.open(url, '_blank');
        }

        var toolHeaders = [
          d.data.name,
          'Updated: ' + d.data.date
        ]

        var labelWrap = toolTipWrap.append('g')

        var labelText = labelWrap.selectAll('text')
          .data( toolHeaders.concat(d.data.subjects) )
          .join('text')
          .attr('class', (a,i) => (i == 0) ? 'name' : (i == 1) ? 'metrics' : 'subjects')
          .style('font-size', (a,i) => i == 0 ? `${fontSize1}`+'pt' : i < 2 ? `${fontSize1-2}`+'pt' : `${fontSize1-4}`+'pt')
          .style('position', 'absolute')
          .style('pointer-events', (a,i) => (i == 0) ? 'all' : 'none')
          .style('cursor', 'pointer')
          .style('font-weight', '500')

          .style('alignment-baseline', 'middle')
          .style('text-decoration', (a,i) => (i == 0) ? 'underline' :'none')
          .style('text-shadow', '3px 3px 3px #FFF, -3px 3px 3px #FFF,  3px -3px 3px #FFF, -3px -3px 3px #FFF ')
          .attr('text-anchor', toolFlipMain == 1 ? 'start' : 'end')
          .attr('x', (a,i) => i == 0 ? d.x + 24 * toolFlipMain : d.x + 32 * toolFlipMain)
          .text(a => (a == 'root') ? 'Harvard Dataverse Repository' : truncate(a.replace(' Dataverse', '')))
          .attr('y', (a,i) => (d.y) + ((i < 2) ? (i) * 23 : 16 + (i) * 17))
          .attr('opacity', 1)
          .attr('fill', (a,i) => (i == 0) ? '#0056F4' : 'black')


        const linkOver = (event) => {
          d3.select(event.currentTarget)
            .transition()
            .delay(10)
            .duration(90)
            .attr('fill', '#A3A3A3')
        }
        const linkOut = (event) => {
          d3.select(event.currentTarget)
            .transition()
            .delay(5)
            .duration(20)
            .attr('fill', '#0056F4')
        }

        labelWrap.select('.name')
          .on('mouseover', (event, e) => {
            linkOver(event)
          })
          .on('mouseout', (event, e) => {
            linkOut(event)
          })
          .on('click', () => send(d.data.identifier))


        var exit = overLay
          .append('image')
          .attr('href', './icons/exit.svg')
          .attr('width', iconDiameter)
          .attr('x', d.x + (-2.5 * toolFlipMain - 2.5))
          .attr('y', d.y - iconDiameter/2)
          .style('pointer-events', 'all')
          .style('cursor', 'pointer')
          .attr('opacity', 0)

        exit
          .transition()
          .duration(200)
          .ease(d3.easeQuadIn)
          .attr('x', d.x + (-28 * toolFlipMain - 12))
          .attr('opacity', .9)

        const transition_2 = d3.transition()
          .delay(20)
          .duration(90)
          .ease(d3.easeQuadOut)

        exit
          .on('mouseover', (event) => {
            var current = d3.select(event.currentTarget)
            .transition()
            .delay(20)
            .duration(90)
            .ease(d3.easeQuadIn)
            .attr('width', iconDiameter+4)
            .attr('x', d.x + (-28 * toolFlipMain - 12) - 2)
            .attr('y', d.y - (iconDiameter+4)/2)
          })
          .on('mouseout', (event) => {
            d3.select(event.currentTarget)
            .transition()
            .duration(40)
            .ease(d3.easeQuadIn)
            .attr('width', iconDiameter)
            .attr('x', d.x + (-28 * toolFlipMain - 12))
            .attr('y', d.y - (iconDiameter)/2)
          })
          .on('click', () => overLay.remove())
  }

    const box = g.append('g')

    var nodes = box.selectAll('g')
      .data(tree.descendants().filter(d => d.children != null))
      .join('g')

    var brighten = (a) => {
      var c = d3.hsl(a)
      c.opacity = 1
      return (c + "")
    }

    var paths = nodes
      .append('path')
      .attr('stroke', d => (d.data.subjects.length > 1 || d.data.name == 'root') ? '#CCCCCC' : brighten(subjectColorScale(d.data.subjects[0])) )
      .attr('fill', 'transparent')
      .attr('stroke-width', 1.5)
      .attr('d', (d, i) => drawLink(d) )
      .attr('transform', 'translate(1000,0)')

    paths
      .transition()
      .duration(500)
      .ease(d3.easeSin)
      .delay((d, i) => { return i * .5 })
      .attr('transform', 'translate(0,0)')

    var circles = nodes
      .append('circle')
      .attr('r', 1.5)
      .attr('fill', d => (d.y == root.y) ? '#ADADAD' : subjectColorScale(d.data.subjects[0]) )
      .attr('opacity', 1)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)


    var n = 0

     const timer = d3.timeout((elapsed) => {
       nodes
         .on('mouseover', over)
         .on('mouseout', out)
         .on('click', stay)
       }
      , 1000);
    };

    draw(root, subjectList, 'time');

    const byTime = root.copy()
    const bySize = root.copy().sort((a, b) => a.value - b.value)

    const whichRoot = (root, n) => {
      return (n == 'time') ? byTime : bySize
    }

    eachButton
      .on('click', (event, d) => newDraw(whichRoot(root, d.root), subjectList, event, d.root))

    const newDraw = (root, subjectList, event, sortType) => {

      const runDraw = () => {
        d3.select('#main-viz').remove()
        draw(root, subjectList, sortType)
      }

    var thisButton = $(event.currentTarget)
    var thatButton = $(event.currentTarget).siblings()

    thisButton.attr('fill') == '#999999' ? runDraw() : null
    thisButton
      .attr('fill', '#000')
    thatButton
      .attr('fill', '#999999')

    }




    //////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////




})

const aboutText = "This tree visualizes the structure of the Harvard Dataverse repository. Two concessions were made for performance and user experience reasons. First, datasets are not visualized. Both datasets and Dataverse collections (or 'virtual repositories') can be present at every level beneath the Harvard Dataverse repository. Here, we only show Dataverse collections. Second, any Dataverse collection with less than four children is not represented in the visualization. 'Children' can refer to either a Dataverse collection or a dataset. In addition, some large collections' size has been reduced visually."


const aboutFlex = d3.select('.viz-about')
  .style('display', 'flex')
  .style('align-items', 'center')
  .style('flex-direction', 'column')
  .style('width', '100%')

const about = aboutFlex.append('div')
  .style('display', 'flex')
  .style('align-items', 'center')
  .style('flex-direction', 'column')
  .style('max-width', '600px')
  .style('width', '80%')


var aboutSwitch = 0

about.append('div')
  .html('Learn More')
  .style('align-self', 'flex-start')
  .style('pointer-events', 'all')
  .style('cursor', 'pointer')
  .style('font-size', '12pt')
  .style('margin-top', '20px')
  .style('color', '#000')
  .on('mouseover', (event) => {
    d3.select(event.currentTarget)
      .style('color', 'blue')
  })
  .on('mouseout', (event) => {
    d3.select(event.currentTarget)
      .style('color', '#000')
  })

  .on('click', () => {
    var c = d3.select('#aboutTextWrap')
    if (aboutSwitch == 0) {
      var cA = c.append('div')
        .style('opacity', 0)
        .html(aboutText)
      cA
        .transition()
        .duration(500)
        .ease(d3.easeQuadIn)
        .style('opacity', 1)
      c
        .transition()
        .duration(200)
        .ease(d3.easeQuadIn)
        aboutSwitch = 1
    } else {
      var cA = c.select('div')
      .remove()
      aboutSwitch = 0
    }


  })


var aboutTextWrap = about.append('div')
  .attr('id', 'aboutTextWrap')
  .style('justify-self', 'center')
  .style('text-indent', '40px')
  .style('margin-top', '20px')
  .style('font-size', '11pt')
  .style('width', '100%')
  .style('height', 'auto')
  .style('padding-bottom', '20px')
  .style('opacity', 1)
  .style('border-bottom', '1px solid #adadad')

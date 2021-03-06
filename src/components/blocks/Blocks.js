import Blockly from 'node-blockly/browser';
import Interpreter from 'js-interpreter';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';


import {
  dispatchWitchMoveUp, dispatchWitchMoveDown,
  dispatchWitchMoveLeft, dispatchWitchMoveRight,
  dispatchWitchReset,
  dispatchWitchPickUpItem, dispatchWitchCastSpell,
  dispatchUserLevel, dispatchWitchLevel,
  dispatchWitchResetMessage
  } from '../../store';

import { FlatButton, RaisedButton, Snackbar } from 'material-ui';
import { Directions, GameError } from '../'
import history from '../../history';


const style = {
  margin: 12,
};

Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
Blockly.JavaScript.addReservedWords('highlightBlock');

// defining blocks
Blockly.Blocks['witch_up'] = {
  init: function() {
    this.appendDummyInput().appendField('witch up'); // word(s) inside the block
    this.setPreviousStatement(true, null); // top connector
    this.setNextStatement(true, null); // bottom connector
    this.setColour(300); // color
  }
};
Blockly.Blocks['witch_down'] = {
  init: function() {
    this.appendDummyInput().appendField('witch down');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
  }
};
Blockly.Blocks['witch_left'] = {
  init: function() {
    this.appendDummyInput().appendField('witch left');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
  }
};
Blockly.Blocks['witch_right'] = {
  init: function() {
    this.appendDummyInput().appendField('witch right');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
  }
};
Blockly.Blocks['pick_up'] = {
  init: function() {
    this.appendDummyInput().appendField('pick it up');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(345);
  }
};
Blockly.Blocks['cast_spell'] = {
  init: function() {
    this.appendDummyInput().appendField('cast spell');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(345);
  }
};
Blockly.Blocks['near_a_monster'] = {
  init: function() {
    this.appendDummyInput().appendField('near an obstacle');
    this.setOutput(true, null);
    this.setColour(345);
  }
};


// defining block behaviors
Blockly.JavaScript['witch_up'] = function(block) {
  return '__witch_up();\n'; // this will go to the interpreter
};
Blockly.JavaScript['witch_down'] = function(block) {
  return '__witch_down();\n';
};
Blockly.JavaScript['witch_left'] = function(block) {
  return '__witch_left();\n';
};
Blockly.JavaScript['witch_right'] = function(block) {
  return '__witch_right();\n';
};
Blockly.JavaScript['pick_up'] = function(block) {
  return '__pick_up();\n';
};
Blockly.JavaScript['cast_spell'] = function(block) {
  return '__cast_spell();\n';
};
Blockly.JavaScript['near_a_monster'] = function(block) {
  return ['__near_a_monster()', Blockly.JavaScript.ORDER_NONE];
};


function createWitchApi(comp) {
  return function(interpreter, scope) {
    interpreter.setProperty(scope, 'highlightBlock',
      interpreter.createNativeFunction(function(id) {
        comp.witchWorkspace.highlightBlock(id);
      }));

    interpreter.setProperty(scope, '__witch_up',
        interpreter.createNativeFunction(function() {
      comp.props.move_up(); // call the function to make witch move on canvas
    }));
    interpreter.setProperty(scope, '__witch_down',
        interpreter.createNativeFunction(function() {
      comp.props.move_down();
    }));
    interpreter.setProperty(scope, '__witch_left',
        interpreter.createNativeFunction(function() {
      comp.props.move_left();
    }));
    interpreter.setProperty(scope, '__witch_right',
        interpreter.createNativeFunction(function() {
      comp.props.move_right();
    }));
    interpreter.setProperty(scope, '__pick_up',
        interpreter.createNativeFunction(function() {
      comp.props.pick_up();
    }));
    interpreter.setProperty(scope, '__cast_spell',
        interpreter.createNativeFunction(function() {
      comp.props.cast_spell();
    }));
    interpreter.setProperty(scope, '__near_a_monster',
      interpreter.createNativeFunction(function() {
        return {
          toBoolean: () => {
            return comp.props.near_a_monster;
          }
        };
    }));
  }
};

const workspaceStyle = {
  height: '512px',
  width: '512px'
};

const toolboxXml = `<xml>
    <block type="witch_up"></block>
    <block type="witch_down"></block>
    <block type="witch_left"></block>
    <block type="witch_right"></block>
    <block type="pick_up"></block>
    <block type="cast_spell"></block>
    <block type="near_a_monster"></block>
    <block type="controls_repeat_ext">
      <value name="TIMES">
        <block type="math_number">
          <field name="NUM">10</field>
        </block>
      </value>
    </block>
    <block type="controls_if"></block>
  </xml>`;

// const toolboxBeginning = `<xml>
//     <block type="witch_up"></block>
//     <block type="witch_down"></block>
//     <block type="witch_left"></block>
//     <block type="witch_right"></block>
//     <block type="controls_repeat_ext">
//       <value name="TIMES">
//         <block type="math_number">
//           <field name="NUM">10</field>
//         </block>
//       </value>
//     </block>`;
// const toolboxEnding = `</xml>`;
// const toolboxLevel3 = `<block type="pick_up"></block>
//     <block type="cast_spell"></block>`;
// const toolboxLevel4 = `<block type="near_a_monster"></block>
//     <block type="controls_if"></block>`;

// let toolboxXml = ``;

// function createToolboxXml(level) {

//   if(+level <= 2) {
//     toolboxXml = toolboxBeginning + toolboxEnding;
//   } else if(+level === 3 || +level === 4) {
//     toolboxXml = toolboxBeginning + toolboxLevel3 + toolboxEnding;
//   } else {
//     toolboxXml = toolboxBeginning + toolboxLevel3 + toolboxLevel4 + toolboxEnding;
//   }
// }


class Blocks extends Component {

  constructor() {
    super();
    this.state = {
      open: true,
      error: [],
      errorOpen: false,
      congrats: false
    }
  	this.runCode = this.runCode.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleOtherClose = this.handleOtherClose.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.handleCongratsClose = this.handleCongratsClose.bind(this);
    this.goNextLevel = this.goNextLevel.bind(this);
  }

  componentDidMount() {
    // createToolboxXml(this.props.level); // this.props.level comes from Game.js
    this.witchWorkspace = Blockly.inject('blocklyDiv', {media: './media', toolbox: toolboxXml});
  }

  handleOpen() {          this.setState({ open: true }); }
  handleClose() {         this.setState({ open: false }); }
  handleRequestClose() {  this.setState({ errorOpen: false, error: [] }); }
  handleOtherClose() {    this.props.resetWitchMessage(); }
  handleCongratsClose() { this.setState({ congrats: false }); }


  goNextLevel() {
    const nextLevel = this.props.gameLevel + 1;
    history.push({
      pathname: `/level/${nextLevel}`,
      state: { type: this.props.gameType }
    })
    this.witchWorkspace.clear();
    // this.props.reset();
    this.props.get_next_game(nextLevel);
    this.setState({
      error: [],
      errorOpen: false,
      congrats: false
    });
  }

  runCode() {
    this.props.reset();
    let code = Blockly.JavaScript.workspaceToCode(this.witchWorkspace);
    let interpreter = new Interpreter(code, createWitchApi(this));
    // interpreter.run(); // run the code as a whole
    let id = setInterval(() => {
      try {
        if (this.props.at_end_point) {
          clearInterval(id);
          // alert("Success! You can now enter the next level!");
          this.setState({congrats: true})
          // this.props.reset(); // reset witch position and at_end_point
          this.props.set_user_level(this.props.userLevel + 1);
          // this.props.get_next_game(this.props.gameLevel + 1); // go to the next level
        }
        if (!interpreter.step()) {
          clearInterval(id);
          this.witchWorkspace.highlightBlock(null);
        }
      } catch(e) {
        clearInterval(id);
        this.witchWorkspace.highlightBlock(null);
        // alert("An " + e);
        let message = e.message;
        this.setState({
          error: [message],
          errorOpen: true
        })
      }
    }, 20);
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Okay"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleClose}
      />,
    ];

    const moreActions = [
      <FlatButton
        label="Okay"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleCongratsClose}
      />
    ]

    return (
      <div>
      	<div>
      	  <div id="blocklyDiv" style={workspaceStyle}></div>
        </div>
        <h2>Bag: {this.props.witchBag.length ? this.props.witchBag[0] : "Empty"}</h2>
        <RaisedButton
          label="Run Blocks"
          primary={true}
          style={style}
          onClick={this.runCode}/>
        <RaisedButton
          label="Help"
          onClick={this.handleOpen}/>
        {
          this.props.gameLevel < 5 ?
          <RaisedButton
            label="Next Level"
            style={style}
            onClick={this.goNextLevel}/> :
          <Link to="/"><RaisedButton
            label="Home"
            style={style}/></Link>
        }
        <Directions
          actions={actions}
          open={this.state.open}
          close={this.handleClose}
          title="Help"/>

        {
          this.props.statusMessage !== '' ?
            <Snackbar
              open={this.props.statusMessge !== ''}
              message={this.props.statusMessage}
              autoHideDuration={4000}
              onRequestClose={this.handleOtherClose}
              bodyStyle={{ backgroundColor: '#7B1FA2' }}/> :
            <Snackbar open={false} message={""}/>
        }

        {
           this.state.error.length !== 0 ?
            <Snackbar
              open={this.state.errorOpen}
              message={this.state.error[0]}
              autoHideDuration={4000}
              onRequestClose={this.handleRequestClose}
              bodyStyle={{ backgroundColor: '#7B1FA2' }}/> :
            <Snackbar open={false} message={""}/>
        }

        {
          this.state.congrats === true ?
            <GameError
              title={"Great Job"}
              actions={moreActions}
              open={this.state.congrats}
              message={"You did it! You can now progress to the next level."} /> :
            <div/>
        }

      </div>
    )
  }
}

const mapState = (state) => {
  console.log(state);
  return {
    witchBag: state.witchCoords.witchBag,
    near_a_monster: state.witchCoords.near_a_monster,
    at_end_point: state.witchCoords.at_end_point,
    userLevel: state.userDetail,
    gameLevel: state.witchCoords.level,
    statusMessage: state.witchCoords.statusMessage
  };
}

const mapDispatch = (dispatch) => {
  return {
    move_up: () => dispatch(dispatchWitchMoveUp()),
    move_down: () => dispatch(dispatchWitchMoveDown()),
    move_left: () => dispatch(dispatchWitchMoveLeft()),
    move_right: () => dispatch(dispatchWitchMoveRight()),
    pick_up: () => dispatch(dispatchWitchPickUpItem()),
    cast_spell: () => dispatch(dispatchWitchCastSpell()),
    reset: () => dispatch(dispatchWitchReset()),
    set_user_level: (level) => dispatch(dispatchUserLevel(level)),
    get_next_game: (level) => dispatch(dispatchWitchLevel(level)),
    resetWitchMessage: () => dispatch(dispatchWitchResetMessage()),
  };
}

export default connect(mapState, mapDispatch)(Blocks);
